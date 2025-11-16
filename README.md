# LauncherPAH

## About
LauncherPAH is a launcher and multi-version switcher for Minecraft for Windows GDK versions.
This application will allow you to install GDK versions side by side, allowing you to have multiple game versions available at the same time. This is helpful for scenarios where you may need to switch between game versions without having to install and re-install the game from the Windows Store endless amounts of times. Stable releases and preview releases are both supported.

NOTE: this program will not allow you to pirate the game. You must have purchased Minecraft for Windows from the Microsoft Store and be signed into the store and Xbox app.

## GDK vs. UWP
Since version 1.21.120, Minecraft has switched Windows development from the Universal Windows Platform (UWP) to the more modern Xbox Game Development Kit (GDK). This change
makes Minecraft align more with Xbox Game Pass games.

NOTE: GDK games install significantly slower than UWP games. To improve install times, you may add an exception for C:\XboxGames (or equivalent install drive) to Windows Defender.  This can improve install times from ~10 minutes to less than 30 seconds.

## Features
- Profiles: this feature separates user data (resource packs, add-ons, worlds, settings)
between installation instances.
- Multi-instances: this feature allows you to have multiple Minecraft game windows open at once.
- Disabling of automatic updating while launching: this launcher removes the window that appears before the game opens, that automatically updates the game if there is an update available (note: users may still opt to download and use the most-up-to-date version in the profile settings).
- Sideloading: if you have access to Minecraft builds that can be sideloaded, this launcher allows you to install those builds and assign them to a profile.

## Differences Between Previous Launchers
- To install new game versions, this application installs the game files to the XboxGames
folder in the specified drive before transferring the files to the permanent install location. While transferring to the permanent install location, a UAC prompt will appear. It is not necesarry to approve this dialog.
- After installation via the launcher, the game will not be re-registered for the user. This is intentional, otherwise the store will automatically overwrite the registered version without the user's consent, even if they have automatic updates disabled. This means that Minecraft will not appear in the start menu or taskbar. You must use this launcher to launch the game (or locate the install location and launch the executable from there).
    - As a result of not registering the game after installation, all file associations will not work. This means, for example, you cannot open a .mcpack and import it in game. There are plans to register the file Minecraft file associations to this launcher, allowing users to select which profile to import content in when opening the file.
- This program will not install UWP game versions. Only GDK versions are supported at this time.

## Development Roadmap
- [ ] Implement lancher settings page.
- [ ] Allow changing installation folder location.
- [ ] Add changing profile folder location.
- [ ] Implement user data migration on first launch.
- [ ] Register all Minecraft file associations to LauncherPAH, 
- [ ] Allow Editor Mode to be launched from LauncherPAH.