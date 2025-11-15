const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FileUploaderV3Module", (m) => {
  const fileUploader = m.contract("FileUploaderV3");

  return { fileUploader };
});
