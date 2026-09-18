# Testing keystore (not for store release)

`debug.keystore` signs the **internal testing APKs** built by GitHub Actions so that a newer
build can be installed over an older one on a test phone. Credentials are the standard
Android debug ones (`android` / `androiddebugkey` / `android`) — the file is public on purpose
and gives no access to anything.

Store releases are signed by Google Play App Signing with a separate upload key that never
lives in this repository.
