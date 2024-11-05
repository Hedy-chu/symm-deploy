import { ethers, run, upgrades} from "hardhat";
import { Addresses, loadAddresses, saveAddresses } from "../utils/file";

async function main() {
	const [deployer] = await ethers.getSigners()

	console.log("Deploying contracts with the account:", deployer.address)
	let deployedAddresses: Addresses = loadAddresses()
	console.log("Deployed Addresses:", deployedAddresses);

	const SymmioPartyA = await ethers.getContractFactory("SymmioPartyA")

	const Factory = await ethers.getContractFactory("MultiAccount")
	console.log("Factory Deployed. ");

	const admin = process.env.ADMIN_PUBLIC_KEY
	const contract = await upgrades.deployProxy(Factory, [
		admin, deployedAddresses.symmioAddress,
		SymmioPartyA.bytecode,
	], { 
		initializer: "initialize",
	  })

	const contractAddr = await contract.getAddress();
	console.log("Contract Deployed at:", contractAddr);

	const addresses = {
		proxy: contractAddr,
		admin: await upgrades.erc1967.getAdminAddress(contractAddr) ,
		implementation: await upgrades.erc1967.getImplementationAddress(
			contractAddr,
		),
	}
	console.log(addresses)

	deployedAddresses.multiAccountAddress = contractAddr
	saveAddresses(deployedAddresses)

	try {
		console.log("Verifying contract...")
		await new Promise((r) => setTimeout(r, 15000))
		await run("verify:verify", { address: addresses.implementation })
		console.log("Contract verified!")
	} catch (e) {
		console.log(e)
	}
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
	  console.error(error)
	  process.exit(1)
  })