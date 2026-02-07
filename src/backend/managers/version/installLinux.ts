import { tryRun, run } from "../../utils/bash";
import * as settings from "../../settings";
import { dump } from "js-yaml";
import path from "node:path";
import * as fsAsync from "node:fs/promises";
import * as fs from "node:fs";
import { basename } from "path";
import { moveExecutable } from "../../utils/move";

const dockerJSON = {
    services: {
        windows: {
            image: "dockurr/windows",
            container_name: "MinecraftInstaller",
            environment: {
                VERSION: "11",
                RAM_SIZE: "8G",
                CPU_CORES: "8",
                DISK_SIZE: "64G",
                USERNAME: "Docker",
                PASSWORD: "admin",
            },
            devices: ["/dev/kvm", "/dev/net/tun"],
            cap_add: ["NET_ADMIN"],
            ports: ["3389:3389/tcp", "3389:3389/udp"],
            volumes: ["./storage:/storage", "./shared:/shared", "./oem:/oem"],
            restart: "unless-stopped",
            stop_grace_period: "2m",
        },
    },
};

const dockerComposeYaml = dump(dockerJSON);

const installBatContents = `@echo off

powershell -NoProfile -ExecutionPolicy Bypass -Command "& { Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'; Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0; Start-Service sshd; Set-Service -Name sshd -StartupType Automatic; if (-not (Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue)) { Write-Output 'Firewall Rule OpenSSH-Server-In-TCP does not exist, creating it...'; New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 } else { Write-Output 'Firewall rule OpenSSH-Server-In-TCP already exists.' } }"`;

export async function installLinux(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false, profile?: IProfile) {
    settings.setInstallationLock(true);
    const hasAllDependencies = await hasDependencies(window);
    if (!hasAllDependencies) return;

    const fileName = basename(file);
    const dockerFolder = settings.getDockerLocation();
    const dockerFileLocation = path.join(dockerFolder, "docker-compose.yml");
    const folderNames = ["shared", "storage", "oem"];
    const oemFolder = path.join(dockerFolder, "oem");
    const sharedFolder = path.join(dockerFolder, "shared");
    const targetLocation = path.join(sharedFolder, fileName.replace(".msixvc", "") + (sideloaded ? "_sideloaded" : ""));
    const finalLocation = path.join(settings.installationsLocation, fileName.replace(".msixvc", "") + (sideloaded ? "_sideloaded" : ""));
    const installBatLocation = path.join(oemFolder, "install.bat");
    await createDockerFolders(folderNames, dockerFolder);

    await fsAsync.writeFile(dockerFileLocation, dockerComposeYaml);
    await fsAsync.writeFile(installBatLocation, installBatContents);

    window.webContents.send("progressStage", "Starting Docker...");
    const composeOutput = await run(`cd ${dockerFolder} && docker compose down && docker compose up -d`, true);
    if (composeOutput.startsWith("Error:")) {
        window.webContents.send("showError", composeOutput);
        window.webContents.send("progressStage", "idle");
        settings.setInstallationLock(false);
        return;
    }

    window.webContents.send("progressStage", "Installing Docker dependencies...");
    const execOutput = await run(`cd ${dockerFolder} && docker exec -t MinecraftInstaller /bin/bash -c "apt update && apt install -y ssh sshpass"`);
    if (execOutput.startsWith("Error:")) {
        window.webContents.send("showError", execOutput);
        window.webContents.send("progressStage", "idle");
        settings.setInstallationLock(false);
        return;
    }

    window.webContents.send("progressStage", "Grabbing docker IP (if this is the first boot, this may take a while)...");
    const ip = await getSshIp(dockerFolder);

    window.webContents.send("progressStage", "Waiting for Docker container to boot...");
    await setupWindows(dockerFolder, ip);

    window.webContents.send("progressStage", "Please set up windows (WIP)");
    //run("xfreerdp /v:localhost:3389 /u:Docker /p:admin /cert:ignore");

    window.webContents.send("progressStage", "Moving MSIXVC to Windows...");
    // Using built in move since it is faster.
    await run(`mv ${file} ${sharedFolder}`);

    const windowsInstallLocation = isBeta ? settings.getDefaultPreviewLocation() : settings.getReleaseLocation();
    const windowsSharedLocation = `C:\\Users\\Docker\\Desktop\\Shared`;
    const targetWindowsLocation = `${windowsSharedLocation}\\${fileName.replace(".msixvc", "") + (sideloaded ? "_sideloaded" : "")}`;

    const installScript = `
mkdir ${targetWindowsLocation}
try {
    $name = (Get-AppxPackage -Name "${isBeta ? settings.previewPackageName : settings.releasePackageName}").PackageFullName; Remove-AppxPackage -Package $name;
}
catch {
    Write-Host "Package not installed, skipping remove."
}

move "${windowsSharedLocation}\\${fileName}" C:\\Users\\Docker\\Desktop
Add-AppxPackage 'C:\\Users\\Docker\\Desktop\\${fileName}' -Volume 'C:\\XboxGames'
${moveExecutable(windowsInstallLocation, targetWindowsLocation)}
robocopy "${windowsInstallLocation}" "${targetWindowsLocation}" /XF *.exe /E /MOVE /MT:8 /W:5 /NFL /NDL
try {
    $name = (Get-AppxPackage -Name "${isBeta ? settings.previewPackageName : settings.releasePackageName}").PackageFullName; Remove-AppxPackage -Package $name;
}
catch {
    Write-Host "Package not installed, skipping remove."
}
Remove-Item -Path "C:\\Users\\Docker\\Desktop\\${fileName}" -Force
New-Item ${windowsSharedLocation}\\install_complete.txt -type file
`;

    window.webContents.send("progressStage", "Installing game files...");

    await fsAsync.writeFile(path.join(sharedFolder, "install.ps1"), installScript);
    await run(
        `cd ${dockerFolder} && docker exec MinecraftInstaller /bin/bash -c "sshpass -p 'admin' ssh -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Docker@${ip} 'powershell -NoProfile -ExecutionPolicy Bypass -Command \\"& { winget install --id Microsoft.Sysinternals.PsTools --source winget -e }\\"'"`,
    );
    let user = await run(
        `cd ${dockerFolder} && docker exec MinecraftInstaller /bin/bash -c "sshpass -p 'admin' ssh -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Docker@${ip} 'powershell -NoProfile -ExecutionPolicy Bypass -Command whoami'"`,
    );
    user = user.replace("\n", "");
    run(
        `cd ${dockerFolder} && docker exec MinecraftInstaller /bin/bash -c "sshpass -p 'admin' ssh -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Docker@${ip} 'PsExec.exe -u ${user} -p admin -accepteula -i 1 -d powershell.exe -ExecutionPolicy Bypass -File ${windowsSharedLocation}\\install.ps1'"`,
    );

    await watchForInstallationComplete(sharedFolder);

    window.webContents.send("progressStage", "Moving files to installation directory...");
    await run(`mv ${targetLocation} ${finalLocation}`);
    run(`cd ${dockerFolder} && docker compose down`);

    window.webContents.send("progressStage", "idle");
    settings.setInstallationLock(false);
}

async function watchForInstallationComplete(folder: string) {
    const watcher = fsAsync.watch(folder, { recursive: false });
    for await (const event of watcher) {
        if (event.eventType === "change" && event.filename === "install_complete.txt") {
            await fsAsync.rm(path.join(folder, "install_complete.txt"));
            return;
        }
    }
}

async function setupWindows(dockerFolder: string, ip: string) {
    const sshOutput = await run(
        `cd ${dockerFolder} && docker exec MinecraftInstaller sshpass -p 'admin' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=2 Docker@${ip} "powershell -NoProfile -Command Write-Output ready"`,
    );
    if (sshOutput.startsWith("Error:") && !sshOutput.includes("Warning:")) {
        await setupWindows(dockerFolder, ip);
    }
}

async function getSshIp(dockerFolder: string): Promise<string> {
    let sshOutput = await run(
        `cd ${dockerFolder} && docker exec MinecraftInstaller sh -c "ifconfig | grep -A 1 'docker:' | awk '/inet /{print \\$2; exit}' | sed 's/[0-9]*\\$/2/'"`,
    );
    if (sshOutput === "") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        sshOutput = await getSshIp(dockerFolder);
    }
    sshOutput = sshOutput.replace("\n", "");
    return sshOutput;
}

async function createDockerFolders(names: string[], folder: string) {
    for (const name of names) {
        const folderPath = path.join(folder, name);
        if (fs.existsSync(folderPath)) continue;
        await fsAsync.mkdir(folderPath);
    }
}

async function hasDependencies(window: Electron.BrowserWindow): Promise<boolean> {
    let errorString = "Missing dependencies: ";
    let shouldError = false;

    const hasDocker = await tryRun("docker --version");
    if (!hasDocker) {
        errorString += "docker, ";
        shouldError = true;
    }

    const hasRDP = await tryRun("xfreerdp --version");
    if (!hasRDP) {
        errorString += "xfreerdp, ";
        shouldError = true;
    }

    const hasSSHPass = await tryRun("sshpass");
    if (!hasSSHPass) {
        errorString += "sshpass, ";
        shouldError = true;
    }

    if (shouldError) {
        errorString = errorString.replace(/, $/, "");
        console.log(errorString);
        window.webContents.send("progressStage", "idle");
        window.webContents.send("showError", errorString);
        settings.setInstallationLock(false);
    }

    return !shouldError;
}
