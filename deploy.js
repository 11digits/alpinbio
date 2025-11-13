import ftpDeployModule from "ftp-deploy";

const ftpDeploy = new ftpDeployModule();

const config = {
  user: "alpinbio",
  password: "l!OWi]O35x17vX",  // insert your password
  host: "alpinbio.ro",
  port: 21,
  localRoot: "dist",
  remoteRoot: "/plati.alpinbio.ro",
  include: ["**/*"],
  deleteRemote: false,
  forcePasv: true
};

ftpDeploy
  .deploy(config)
  .then(() => console.log("✅ Upload complete!"))
  .catch(err => console.error("❌ Upload failed:", err));
