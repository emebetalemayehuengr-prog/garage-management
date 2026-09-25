# Samsung TV package

The production site is configured to run as a Samsung Tizen Web application.

## Required one-time setup

1. Install Tizen Studio.
2. In Package Manager, install Web CLI, Samsung TV Extensions, TV Extensions Tools, and Samsung Certificate Extension.
3. In Certificate Manager, create a **Samsung** certificate profile and add the target TV DUID.
4. Enable Developer Mode on the TV and connect it in Device Manager.

## Build and sign

```powershell
npm run tv:package -- -CertificateProfile YOUR_PROFILE_NAME
```

The command builds the React application, verifies package-relative assets, creates the Tizen web build, and emits a signed `.wgt` under `dist/.buildResult`.

## Install on a connected TV

```powershell
tizen install -t YOUR_DEVICE_ID --name GarageMS.wgt -- dist/.buildResult
```

Use `sdb devices` to find the device ID. The computer and TV must be on the same network, and the TV must permit application installation.
