import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function upgrade() {
  const proxyAddress = process.env.MULTI_ACCOUNT;
  if (!proxyAddress) {
    throw new Error("Missing proxy address");
  }
  const factory = await ethers.getContractFactory("MultiAccount");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, factory);
  const contractAddr = await upgraded.getAddress();

  console.log("Upgraded contract address:", contractAddr);

  const addresses = {
    proxy: contractAddr,
    admin: await upgrades.erc1967.getAdminAddress(contractAddr),
    implementation: await upgrades.erc1967.getImplementationAddress(
      contractAddr
    ),
  };
  console.log(addresses);

  try {
    console.log("Verifying contract...");
    await new Promise((r) => setTimeout(r, 15000));
    await run("verify:verify", { address: addresses.implementation });
    console.log("Contract verified!");
  } catch (e) {
    console.log(e);
  }
}

upgrade()
  .then(() => console.log("Upgrade successful"))
  .catch((error) => console.error("Upgrade failed:", error));
