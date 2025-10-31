// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthDataRegistry {
    struct Record {
        string cid;
        string metadata;
        uint256 timestamp; // time of upload
    }

    // patientId → list of records
    mapping(string => Record[]) private patientRecords;

    // patientId → doctorId → access expiry timestamp
    mapping(string => mapping(string => uint256)) private accessExpiry;

    // Events
    event RecordAdded(string patientId, string cid, uint256 timestamp);
    event AccessRequested(string patientId, string doctorId);
    event AccessGranted(string patientId, string doctorId, uint256 expiry);
    event AccessRevoked(string patientId, string doctorId);

    // Add a new medical record for a patient
    function addRecord(
        string memory patientId,
        string memory cid,
        string memory metadata
    ) public {
        Record memory newRecord = Record({
            cid: cid,
            metadata: metadata,
            timestamp: block.timestamp
        });

        patientRecords[patientId].push(newRecord);
        emit RecordAdded(patientId, cid, block.timestamp);
    }

    // Retrieve all records for a patient
    function getRecords(string memory patientId)
        public
        view
        returns (Record[] memory)
    {
        return patientRecords[patientId];
    }

    // Doctor requests access (off-chain event)
    function requestAccess(string memory patientId, string memory doctorId)
        public
    {
        emit AccessRequested(patientId, doctorId);
    }

    // Patient grants time-bound access to doctor
    function grantAccess(
        string memory patientId,
        string memory doctorId,
        uint256 durationSeconds
    ) public {
        uint256 expiry = block.timestamp + durationSeconds;
        accessExpiry[patientId][doctorId] = expiry;
        emit AccessGranted(patientId, doctorId, expiry);
    }

    // Patient can revoke access manually before expiry
    function revokeAccess(string memory patientId, string memory doctorId)
        public
    {
        accessExpiry[patientId][doctorId] = 0;
        emit AccessRevoked(patientId, doctorId);
    }

    // Check if doctor currently has valid access
    function isAccessGranted(string memory patientId, string memory doctorId)
        public
        view
        returns (bool)
    {
        return accessExpiry[patientId][doctorId] >= block.timestamp;
    }

    // Optional helper: get remaining access time (seconds)
    function getAccessExpiry(string memory patientId, string memory doctorId)
        public
        view
        returns (uint256)
    {
        return accessExpiry[patientId][doctorId];
    }
}