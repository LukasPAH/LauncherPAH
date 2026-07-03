use serde::{Deserialize, Serialize};
use std::{collections::HashMap, env::home_dir, path::Path};

#[derive(Serialize, Deserialize)]
pub struct Settings {
    file_version: u32,
    settings: LocalDataSettings,
}

#[derive(Serialize, Deserialize)]
pub struct LocalDataSettings {
    install_drive: String,
    data_location: Option<String>,
    last_launched_profile: Option<String>,
    profiles: HashMap<String, Profile>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Profile {
    version: String,
    name: String,
    proton_options: Option<ProtonOptions>,
    editor: Option<bool>,
}

impl Profile {
    pub fn new(name: String, version: String) -> Profile {
        let profile: Profile = Profile {
            name: name,
            version: version,
            proton_options: Some(ProtonOptions::default()),
            editor: None,
        };
        return profile;
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProtonOptions {
    enable_wayland: bool,
    enable_hdr: bool,
    enable_logging: bool,
    proton_gdk_version: String,
}

impl ProtonOptions {
    pub fn default() -> ProtonOptions {
        let options: ProtonOptions = ProtonOptions {
            enable_wayland: false,
            enable_hdr: false,
            enable_logging: false,
            proton_gdk_version: "GDK-Proton10-32-Custom-3".to_string(),
        };
        return options;
    }
}

impl Settings {
    pub fn new() -> Settings {
        let default_settings: Settings = Settings {
            file_version: 0,
            settings: LocalDataSettings {
                data_location: None,
                install_drive: "C".to_string(),
                last_launched_profile: None,
                profiles: HashMap::new(),
            },
        };
        return default_settings;
    }
    pub fn get_launcher_data_location(&self) -> String {
        let location_option = self.settings.data_location.clone();
        match location_option {
            Some(value) => {
                return value;
            }
            None => {
                let home_dir_path = home_dir().unwrap();
                let launcher_dir_buf = home_dir_path.join("Games").join("LauncherPAH");
                let launcher_location = launcher_dir_buf.to_str().unwrap();
                return launcher_location.to_string();
            }
        }
    }

    pub fn set_launcher_data_location(&mut self, value: &str) {
        self.settings.data_location = Some(value.to_string());
    }

    pub fn get_data_folder_path(&self) -> String {
        let launcher_location = Self::get_launcher_data_location(&self);
        let path = Path::new(&launcher_location).join("data");
        return path.to_str().unwrap().to_string();
    }

    pub fn get_launched_profile(&self) -> Option<String> {
        return self.settings.last_launched_profile.clone();
    }

    pub fn set_launched_version(&mut self, value: &str) {
        self.settings.last_launched_profile = Some(value.to_string());
    }

    pub fn add_profile(&mut self, value: &Profile) {
        let name = value.name.to_string();
        self.settings.profiles.insert(name, value.clone());
    }

    pub fn remove_profile(&mut self, name: &str) {
        self.settings.profiles.remove(&name.to_string());
    }
}
