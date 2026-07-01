use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct AvailableVersions {
    pub file_version: u32,
    pub previewVersions: Vec<AvailableVersion>,
    pub releaseVersions: Vec<AvailableVersion>,
}

#[derive(Serialize, Deserialize)]
pub struct AvailableVersion {
    pub version: String,
    pub urls: Vec<String>,
}
