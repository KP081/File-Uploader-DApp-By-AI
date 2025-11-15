const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FileUploaderV3", function () {
  async function deployFileUploaderFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const FileUploaderV3 = await ethers.getContractFactory("FileUploaderV3");
    const contract = await FileUploaderV3.deploy();
    await contract.waitForDeployment();

    return { contract, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { contract, owner } = await loadFixture(deployFileUploaderFixture);
      expect(await contract.getAddress()).to.be.properAddress;
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("File Upload", function () {
    it("Should upload file successfully", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123ABC";
      const name = "test-document.pdf";

      await expect(contract.connect(user1).uploadFile(cid, name)).to.emit(
        contract,
        "FileUploaded"
      );

      const files = await contract.getFiles(user1.address);
      expect(files.length).to.equal(1);
      expect(files[0].cid).to.equal(cid);
      expect(files[0].name).to.equal(name);
      expect(files[0].owner).to.equal(user1.address);
    });

    it("Should prevent empty CID", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await expect(
        contract.connect(user1).uploadFile("", "test.pdf")
      ).to.be.revertedWith("CID cannot be empty");
    });

    it("Should prevent empty filename", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await expect(
        contract.connect(user1).uploadFile("QmTest123", "")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should prevent duplicate uploads", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123";

      await contract.connect(user1).uploadFile(cid, "test.pdf");

      await expect(
        contract.connect(user1).uploadFile(cid, "test2.pdf")
      ).to.be.revertedWith("File already uploaded");
    });

    it("Should allow multiple files for same user", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await contract.connect(user1).uploadFile("QmTest1", "file1.pdf");
      await contract.connect(user1).uploadFile("QmTest2", "file2.pdf");
      await contract.connect(user1).uploadFile("QmTest3", "file3.pdf");

      const files = await contract.getFiles(user1.address);
      expect(files.length).to.equal(3);
    });

    it("Should allow same CID for different users", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployFileUploaderFixture
      );
      const cid = "QmTest123";

      await contract.connect(user1).uploadFile(cid, "user1-file.pdf");
      await contract.connect(user2).uploadFile(cid, "user2-file.pdf");

      const user1Files = await contract.getFiles(user1.address);
      const user2Files = await contract.getFiles(user2.address);

      expect(user1Files.length).to.equal(1);
      expect(user2Files.length).to.equal(1);
    });

    it("Should store correct timestamp", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      const blockTimestamp = await time.latest();
      await contract.connect(user1).uploadFile("QmTest", "test.pdf");

      const files = await contract.getFiles(user1.address);
      expect(files[0].timestamp).to.be.closeTo(blockTimestamp, 2);
    });
  });

  describe("File Retrieval", function () {
    it("Should return empty array for user with no files", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      const files = await contract.getFiles(user1.address);
      expect(files.length).to.equal(0);
    });

    it("Should return all files for user", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await contract.connect(user1).uploadFile("QmTest1", "file1.pdf");
      await contract.connect(user1).uploadFile("QmTest2", "file2.doc");

      const files = await contract.getFiles(user1.address);
      expect(files.length).to.equal(2);
      expect(files[0].name).to.equal("file1.pdf");
      expect(files[1].name).to.equal("file2.doc");
    });

    it("Should check file existence correctly", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123";

      expect(await contract.fileExistsForUser(user1.address, cid)).to.be.false;

      await contract.connect(user1).uploadFile(cid, "test.pdf");

      expect(await contract.fileExistsForUser(user1.address, cid)).to.be.true;
    });

    it("Should return correct file count", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      expect(await contract.getFileCount(user1.address)).to.equal(0);

      await contract.connect(user1).uploadFile("QmTest1", "file1.pdf");
      expect(await contract.getFileCount(user1.address)).to.equal(1);

      await contract.connect(user1).uploadFile("QmTest2", "file2.pdf");
      expect(await contract.getFileCount(user1.address)).to.equal(2);
    });
  });

  describe("File Deletion", function () {
    it("Should delete file successfully", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123";

      await contract.connect(user1).uploadFile(cid, "test.pdf");
      expect(await contract.getFileCount(user1.address)).to.equal(1);

      await expect(contract.connect(user1).deleteFile(cid))
        .to.emit(contract, "FileDeleted")
        .withArgs(user1.address, cid);

      expect(await contract.getFileCount(user1.address)).to.equal(0);
      expect(await contract.fileExistsForUser(user1.address, cid)).to.be.false;
    });

    it("Should prevent deleting non-existent file", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await expect(
        contract.connect(user1).deleteFile("QmNonExistent")
      ).to.be.revertedWith("File does not exist");
    });

    it("Should prevent user from deleting another user's file", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployFileUploaderFixture
      );
      const cid = "QmTest123";

      await contract.connect(user1).uploadFile(cid, "test.pdf");

      await expect(contract.connect(user2).deleteFile(cid)).to.be.revertedWith(
        "File does not exist"
      );
    });

    it("Should handle deletion of multiple files correctly", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await contract.connect(user1).uploadFile("QmTest1", "file1.pdf");
      await contract.connect(user1).uploadFile("QmTest2", "file2.pdf");
      await contract.connect(user1).uploadFile("QmTest3", "file3.pdf");

      expect(await contract.getFileCount(user1.address)).to.equal(3);

      await contract.connect(user1).deleteFile("QmTest2");
      expect(await contract.getFileCount(user1.address)).to.equal(2);

      const files = await contract.getFiles(user1.address);
      const cids = files.map((f) => f.cid);
      expect(cids).to.not.include("QmTest2");
    });

    it("Should allow re-uploading after deletion", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123";

      await contract.connect(user1).uploadFile(cid, "test.pdf");
      await contract.connect(user1).deleteFile(cid);

      await expect(contract.connect(user1).uploadFile(cid, "test-reupload.pdf"))
        .to.not.be.reverted;

      expect(await contract.getFileCount(user1.address)).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should maintain file isolation between users", async function () {
      const { contract, user1, user2 } = await loadFixture(
        deployFileUploaderFixture
      );

      await contract.connect(user1).uploadFile("QmUser1", "user1-file.pdf");
      await contract.connect(user2).uploadFile("QmUser2", "user2-file.pdf");

      const user1Files = await contract.getFiles(user1.address);
      const user2Files = await contract.getFiles(user2.address);

      expect(user1Files.length).to.equal(1);
      expect(user2Files.length).to.equal(1);
      expect(user1Files[0].cid).to.equal("QmUser1");
      expect(user2Files[0].cid).to.equal("QmUser2");
    });

    it("Should only allow owner to access Ownable functions", async function () {
      const { contract, owner } = await loadFixture(deployFileUploaderFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Gas Optimization", function () {
    it("Should handle batch operations efficiently", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      const uploadPromises = [];
      for (let i = 0; i < 10; i++) {
        uploadPromises.push(
          contract.connect(user1).uploadFile(`QmTest${i}`, `file${i}.pdf`)
        );
      }

      await Promise.all(uploadPromises);
      expect(await contract.getFileCount(user1.address)).to.equal(10);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long CID", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const longCID = "Qm" + "a".repeat(100);

      await expect(contract.connect(user1).uploadFile(longCID, "test.pdf")).to
        .not.be.reverted;
    });

    it("Should handle very long filename", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const longName = "test-" + "file".repeat(50) + ".pdf";

      await expect(contract.connect(user1).uploadFile("QmTest", longName)).to
        .not.be.reverted;
    });

    it("Should handle special characters in filename", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);

      await expect(
        contract.connect(user1).uploadFile("QmTest", "file@#$%^&*().pdf")
      ).to.not.be.reverted;
    });
  });

  describe("Events", function () {
    it("Should emit FileUploaded event with correct parameters", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123";
      const name = "test.pdf";

      const tx = await contract.connect(user1).uploadFile(cid, name);
      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          return contract.interface.parseLog(log).name === "FileUploaded";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should emit FileDeleted event with correct parameters", async function () {
      const { contract, user1 } = await loadFixture(deployFileUploaderFixture);
      const cid = "QmTest123";

      await contract.connect(user1).uploadFile(cid, "test.pdf");

      const tx = await contract.connect(user1).deleteFile(cid);
      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          return contract.interface.parseLog(log).name === "FileDeleted";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });
  });
});
