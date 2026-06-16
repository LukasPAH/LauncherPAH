flatpak run --command=flathub-build org.flatpak.Builder --install --force-clean ./io.github.lukaspah.launcherpah.yaml
rm -rf .flatpak-builder
rm -rf builddir
rm -rf repo