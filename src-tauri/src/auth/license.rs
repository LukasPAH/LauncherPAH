use reqwest::Client;
use xodus::tokens::TokenManager;
use xodus_cli::commands::license;
use xodus_cli::commands::login;
use xodus_cli::license::get_license;

const RELEASE_CLIENT_ID: &str = "7792d9ce-355a-493c-afbd-768f4a77c3b0";
const PREVIEW_CLIENT_ID: &str = "98bd2335-9b01-4e4c-bd05-ccc01614078b";
const MARKET: &str = "neutral";

pub async fn token_setup(client: &Client) -> TokenManager {
    xodus::secrets::init_secrets().expect("Unable to initialize credentials");
    let tokens = TokenManager::with_keychain_and_memory();
    xodus::tokens::device::ensure_device_credentials(&client, &tokens).await;
    return tokens;
}

pub async fn login(client: &Client, tokens: &TokenManager) {
    let license = get_license(
        client,
        tokens,
        RELEASE_CLIENT_ID.to_string(),
        MARKET.to_string(),
    )
    .await;
    match license {
        Ok(_) => {
            println!("License OK");
        }
        Err(error) => {
            println!("{}", error);
            login::run(client, tokens).await;
        }
    }
}

pub async fn get_key(client: &Client, tokens: &TokenManager, is_preview: bool) {
    let mut content_id = RELEASE_CLIENT_ID;
    if is_preview {
        content_id = PREVIEW_CLIENT_ID;
    }

    license::run(
        client,
        tokens,
        content_id.to_string(),
        MARKET.to_string(),
        "Cik".to_string(),
    )
    .await;
}
