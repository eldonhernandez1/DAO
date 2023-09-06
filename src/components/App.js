import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json';

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [dao, setDao] = useState(null);
  const [treasuryBalance, setTreasuryBalance] = useState(0);

  // Shows recipient balance on the front end
  const [recipientBalance, setRecipientBalance] = useState(0);

  const [proposals, setProposals] = useState(null);
  const [quorum, setQuorum] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // Define the fetchRecipientBalance function separately
  const fetchRecipientBalance = async (recipientAddress) => {
    try {
      // Create an instance of the ethers.js provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Fetch the balance of the recipient's address
      const balance = await provider.getBalance(recipientAddress);

      // Convert the balance to Ether (ETH) and update the state
      const etherBalance = ethers.utils.formatEther(balance);
      setRecipientBalance(etherBalance);
    } catch (error) {
      console.error('Error fetching recipient balance:', error.message);
    }
  };

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    // Initiate contracts
    console.log(config[31337].dao.address, DAO_ABI, provider);
    const dao = new ethers.Contract(config[31337].dao.address, DAO_ABI, provider);
    setDao(dao);

    // Fetch treasury balance
    let treasuryBalance = await provider.getBalance(dao.address);
    treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18);
    setTreasuryBalance(treasuryBalance);

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    // Fetch proposals count
    const count = await dao.proposalCount();
    const items = [];

    for (var i = 0; i < count; i++) {
      const proposal = await dao.proposals(i + 1);
      items.push(proposal);
    }

    setProposals(items);

    // Fetch quorum
    setQuorum(await dao.quorum());

    setIsLoading(false);
  };

  useEffect(() => {
    const recipientAddress = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65';
    fetchRecipientBalance(recipientAddress);
  }, []);

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    <Container>
      <Navigation account={account} />

      <h1 className='my-4'>Discover the Kalina Decentralized <br />Autonomous Organization (DAO)</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Create
            provider={provider}
            dao={dao}
            setIsLoading={setIsLoading}
          />

          <h3 className=''>Easy made governance</h3>
          <h3 className=''>It's simple to cast votes and make proposals, so there are no barriers to entry for members.</h3>
          <hr />

          <p className='text-center'><strong>Treasury Balance:</strong> {treasuryBalance} ETH</p>
          <p className="text-center"><strong>Recipient Balance:</strong> {recipientBalance} ETH</p>

          <hr />

          <Proposals
            provider={provider}
            dao={dao}
            proposals={proposals}
            quorum={quorum}
            setIsLoading={setIsLoading}
          />
        </>
      )}
    </Container>
  );
}

export default App;
