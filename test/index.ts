import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use } from "chai";
import { ethers } from "hardhat";
import { Charity } from "../typechain";

var contract: Charity;
var accounts: SignerWithAddress[];

before(async function () {
    const CharityFactory = await ethers.getContractFactory("Charity");

    contract = await CharityFactory.deploy();

    await contract.deployed();

    accounts = await ethers.getSigners();
})

describe("Charity contract", function () {
    it("No campagin defined after deployment", async function () {
        expect(await contract.getCampaignCount()).to.equal(0);
    });

    it("A new campaign is created", async () => {
        const tx = await contract.startCampaign(
            "Test campaign",
            "This is the description",
            "http://localhost:3000/conference-64.png",
            Math.round(new Date().getTime() / 1000) + 3600);
        await tx.wait();

        expect(await contract.getCampaignCount()).to.equal(1);
    })

    it("A new campaign is correctly created", async () => {
        const campaginId = await contract.generateCampaignId(
            accounts[0].address,
            "Test campaign",
            "This is the description");
        const campaign = await contract.getCampaign(campaginId);

        expect(campaginId).not.equal(0);
        expect(campaign.title).be.equal("Test campaign");
        expect(campaign.description).be.equal("This is the description");
    })

    it("Creates 5 more campaigns", async () => {
        for (let i = 0; i < 5; i++) {
            const tx = await contract.startCampaign(
                "Test campaign number " + String(i),
                "This is the description for campagin number " + String(i),
                "http://localhost:3000/conference-64.png",
                Math.round(new Date().getTime() / 1000) + 3600);
            await tx.wait();
        }
        expect(await contract.getCampaignCount()).to.equal(6);
    })

    it("Correctly returns a batch of the first 5 campaigns", async () => {
        const campaigns: any[] = await contract.getCampaignsInBatch(0);

        let campaign = await contract.getCampaign(campaigns[0]);

        expect(campaign.title).equal("Test campaign")
        expect(campaigns.length).equals(5);
    })

    it("Campaign 1 receive a donation", async () => {
        const campaignId = await contract.generateCampaignId(
            accounts[0].address,
            "Test campaign",
            "This is the description");

        await contract.connect(accounts[1]).donateToCampaign(campaignId, { value: ethers.utils.parseEther('0.5') });
        await contract.connect(accounts[1]).donateToCampaign(campaignId, { value: ethers.utils.parseEther('0.5') });

        const campaignAfter = await contract.getCampaign(campaignId);
        const amountDonated = await contract.userCampaignDonations(accounts[1].address, campaignId);

        expect(campaignAfter.balance).equals(amountDonated);
        expect(campaignAfter.balance.isZero()).is.false;
    })

    it("Campaign 1 is closed by its initiator", async () => {
        const campaignId = await contract.generateCampaignId(
            accounts[0].address,
            "Test campaign",
            "This is the description");

        await contract.connect(accounts[0]).endCampaign(campaignId);

        const campaign = await contract.getCampaign(campaignId);

        expect(campaign.isLive).is.false; 
    })

    it("The initiator for Campaign 1 withdraws its money", async () => {
        const campaignId = await contract.generateCampaignId(
            accounts[0].address,
            "Test campaign",
            "This is the description");

        let campaign = await contract.getCampaign(campaignId);

        const accountPreviousBalance = await accounts[0].getBalance();

        await contract.connect(accounts[0]).withdrawCampaignFunds(campaignId, { gasLimit: 30000000 });

        campaign = await contract.getCampaign(campaignId);

        // Campaign balance is 0
        expect(campaign.balance).equals(0);

        // Campaign initiator balance is increased
        expect(await accounts[0].getBalance()).is.above(accountPreviousBalance);
    })
});
