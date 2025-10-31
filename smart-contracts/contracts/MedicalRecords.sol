// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalRecords is Ownable {
    struct Record {
        address uploader; // patient
        string cid;       // IPFS CID
        uint256 timestamp;
    }

    // patient => list of record entries
    mapping(address => Record[]) public records;

    // patient => grantee => expiryTimestamp (0 if revoked)
    mapping(address => mapping(address => uint256)) public accessGrants;

    event RecordUploaded(address indexed patient, string cid, uint256 index);
    event AccessGranted(address indexed patient, address indexed grantee, uint256 expiry);
    event AccessRevoked(address indexed patient, address indexed grantee);

    // ✅ Constructor added for OpenZeppelin v5 Ownable
    constructor() Ownable(msg.sender) {}

    function uploadRecord(string calldata cid) external {
        Record memory r = Record({
            uploader: msg.sender,
            cid: cid,
            timestamp: block.timestamp
        });
        records[msg.sender].push(r);
        emit RecordUploaded(msg.sender, cid, records[msg.sender].length - 1);
    }

    function grantAccess(address grantee, uint256 durationSeconds) external {
        uint256 expiry = block.timestamp + durationSeconds;
        accessGrants[msg.sender][grantee] = expiry;
        emit AccessGranted(msg.sender, grantee, expiry);
    }

    function revokeAccess(address grantee) external {
        accessGrants[msg.sender][grantee] = 0;
        emit AccessRevoked(msg.sender, grantee);
    }

    function hasAccess(address patient, address grantee) public view returns (bool) {
        return accessGrants[patient][grantee] >= block.timestamp || patient == grantee;
    }

    function getRecord(address patient, uint256 index) external view returns (Record memory) {
        require(index < records[patient].length, "Index out of range");
        return records[patient][index];
    }

    function getRecordCount(address patient) external view returns (uint256) {
        return records[patient].length;
    }
}
