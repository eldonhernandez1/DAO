import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';

// Function to shorten Ethereum address
const shortenAddress = (address, chars = 3) => {
  return `${address.substring(0, chars)}...${address.substring(42 - chars)}`;
};

const Proposals = ({ provider, dao, proposals, setIsLoading }) => {
  const voteHandler = async (id) => {
    try {
      const signer = await provider.getSigner()
      const transaction = await dao.connect(signer).vote(id)
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

   // State variable to store quorum
  const [quorum, setQuorum] = useState(0);

  // Function to fetch quorum from the contract
  const fetchQuorum = async () => {
    try {
      const fetchedQuorum = await dao.connect(provider).getQuorum();
      setQuorum(fetchedQuorum);
    } catch (error) {
      console.error('Error fetching quorum:', error.message);
    }
  };

  // Fetch quorum when the component mounts
  useEffect(() => {
    fetchQuorum();
  }, [provider, dao]);


  // Add a new state variable to store descriptions
  const [proposalDescriptions, setProposalDescriptions] = useState([]);

  useEffect(() => {
    // Function to fetch descriptions for all proposals
    const fetchDescriptions = async () => {
      const descriptions = [];
      for (let i = 1; i <= proposals.length; i++) {
        try {
          const description = await dao.connect(provider).getProposalDescription();
          descriptions.push(description);
        } catch (error) {
          console.error(`Error fetching description for proposal ${i}: ${error.message}`);
        }
      }
      setProposalDescriptions(descriptions);
    };

    // Include 'fetchQuorum' in the dependency array
    fetchQuorum();

    // Call the function to fetch descriptions
    fetchDescriptions();
  }, [provider, dao, proposals, fetchQuorum]);

  const voteAgainstHandler = async (id) => {
    try {
      const signer = await provider.getSigner()
      const transaction = await dao.connect(signer).vote(id)
      await transaction.wait()
    } catch {
      window.alert('User has voted against')
    }

    setIsLoading(true)
  }

  const finalizeHandler = async (id) => {
    try {
      const signer = await provider.getSigner()
      const transaction = await dao.connect(signer).finalizeProposal(id)
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

  // To hide the vote button when a user voted
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
  const fetchUserVotes = async () => {
    const userAddress = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'; // Use the user's Ethereum address
    const votes = {};

    for (let i = 0; i < proposals.length; i++) {
      const proposalId = proposals[i].id;
      const hasVoted = await dao.hasVoted(proposalId, userAddress); // Implement this function in your contract
      votes[proposalId] = hasVoted;
    }

    setUserVotes(votes);
  };

  // Call the function to fetch user's vote status
  fetchUserVotes();
}, ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', dao, proposals]);


  return (
    <div>
    <p className='text-center'><strong>Quorum:</strong> {quorum}</p>
      <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Proposal Name</th>
          <th>Proposal Description</th>
          <th>Recipient Address</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Total Votes</th>
          <th>Cast Vote</th>
          <th>Vote Against</th> 
          <th>Finalize</th>
        </tr>
      </thead>
      <tbody>
        {proposals.map((proposal, index) => (
          <tr key={index}>
            <td>{proposal.id.toString()}</td>
            <td>{proposal.name}</td>
            <td>{proposalDescriptions[index]}</td>
            <td>{shortenAddress(proposal.recipient)}</td>
            <td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
            <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
            <td>{proposal.votes.toString()}</td>
            <td>
              {!proposal.finalized && (
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={() => voteHandler(proposal.id)}
                >
                  Vote for
                </Button>
              )}
            </td>
            <td>
              {!proposal.finalized && (
                <Button
                  variant="secondary" 
                  style={{ width: '100%' }}
                  onClick={() => voteAgainstHandler(proposal.id)}
                >
                  Vote Against
                </Button>
              )}
            </td>
            <td>
              {!proposal.finalized && proposal.votes > proposal.quorum && (
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={() => finalizeHandler(proposal.id)}
                >
                  Finalize
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    </div>
  );
}

export default Proposals;
