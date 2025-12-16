// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FileUploaderV3
 */
contract FileUploaderV3 is Ownable, ReentrancyGuard {
    struct FileMetadata {
        string cid;
        string name;
        uint256 timestamp;
        address owner;
    }

    mapping(address => FileMetadata[]) private userFiles;
    mapping(address => mapping(string => bool)) private fileExists;

    event FileUploaded(
        address indexed user,
        string cid,
        string name,
        uint256 timestamp
    );
    event FileDeleted(address indexed user, string cid);

    constructor() Ownable(msg.sender) {}

    function uploadFile(
        string calldata cid,
        string calldata name
    ) external nonReentrant {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!fileExists[msg.sender][cid], "File already uploaded");

        FileMetadata memory newFile = FileMetadata({
            cid: cid,
            name: name,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        userFiles[msg.sender].push(newFile);
        fileExists[msg.sender][cid] = true;

        emit FileUploaded(msg.sender, cid, name, block.timestamp);
    }

    function getFiles(
        address user
    ) external view returns (FileMetadata[] memory) {
        return userFiles[user];
    }

    function fileExistsForUser(
        address user,
        string calldata cid
    ) external view returns (bool) {
        return fileExists[user][cid];
    }

    function deleteFile(string calldata cid) external nonReentrant {
        require(fileExists[msg.sender][cid], "File does not exist");

        FileMetadata[] storage files = userFiles[msg.sender];

        for (uint256 i = 0; i < files.length; i++) {
            if (keccak256(bytes(files[i].cid)) == keccak256(bytes(cid))) {
                files[i] = files[files.length - 1];
                files.pop();
                break;
            }
        }

        fileExists[msg.sender][cid] = false;
        emit FileDeleted(msg.sender, cid);
    }

    function getFileCount(address user) external view returns (uint256) {
        return userFiles[user].length;
    }
}
