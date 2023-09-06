//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    address owner;
    Token public token;
    uint256 public quorum;

    struct Proposal {
        uint256 id;
        string name;
        uint256 amount;
        string description;
        address payable recipient;
        uint256 votes;
        uint256 votesAgainst;
        bool finalized;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    mapping(address => mapping(uint256 => bool)) votes;

    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );
    event Vote(uint256 id, address investor);
    event VoteAgainst(uint256 id, address investor);
    event Finalize(uint256 id);

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    // Allow contract to receive ether
    receive() external payable {}

    modifier onlyInvestor() {
        require(
            token.balanceOf(msg.sender) > 0,
            "must be token holder"
        );
        _;
    }

    // Create proposal
    function createProposal(
        string memory _name,
        uint256 _amount,
        string memory _description,
        address payable _recipient
    ) external onlyInvestor {
        require(bytes(_description).length > 0, "description cannot be empty");
        require(address(this).balance >= _amount);

        proposalCount++;

        proposals[proposalCount] = Proposal (
            proposalCount,
            _name,
            _amount,
            _description,
            _recipient,
            0,
            0,
            false
        );

        emit Propose(
            proposalCount,
            _amount,
            _recipient,
            msg.sender
        );
    }
    // Add a function to get the description of a proposal
    function getProposalDescription(uint256 _id) external view returns (string memory) {
        require(_id > 0 && _id <= proposalCount, "Invalid proposal ID");
        return proposals[_id].description;
    }

    // Vote on proposal
    function vote(uint256 _id) external onlyInvestor {
        // Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        // Don't let investors vote twice
        require(!votes[msg.sender][_id], "already voted");

        // update votes
        proposal.votes += token.balanceOf(msg.sender);

        // Track that user has voted
        votes[msg.sender][_id] = true;

        // Emit an event
        emit Vote(_id, msg.sender);
    }
    // Vote against proposal
    function votesAgainst(uint256 _id) external onlyInvestor {
        // Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        // Don't let investors vote against twice
        require(!votes[msg.sender][_id], "voted against");

        // update votesAgainst
        proposal.votes += token.balanceOf(msg.sender);

        // Track that user has voted against In this example, the voter has voted against
        votes[msg.sender][_id] = true;

        // Emit an event
        emit Vote(_id, msg.sender);
    }

    // Finalize proposal & tranfer funds
    function finalizeProposal(uint256 _id) external onlyInvestor {
        // Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        // Ensure proposal is not already finalized
        require(proposal.finalized == false, "proposal already finalized");

        // Mark proposal as finalized
        proposal.finalized = true;

        // Check that the proposal was voted against
        require(proposal.votesAgainst >= quorum, "proposal was voted against");

        // Check that proposal has enough votes
        require(proposal.votes >= quorum, "must reach quorum to finalize proposal");

        // Check that the contract has enough ether
        require(address(this).balance >= proposal.amount);

        // Transfer the funds to recipient
        (bool sent, ) = proposal.recipient.call{value: proposal.amount}("");
        require(sent);

        // Emit event
        emit Finalize(_id);
    }

        // This fetches th quorum to disply in the front end
        function getQuorum() external view returns (uint256) {
        return quorum;
    }
}
