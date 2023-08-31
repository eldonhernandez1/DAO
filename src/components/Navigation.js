import Navbar from 'react-bootstrap/Navbar';

import logo from '../logo.png';

const Navigation = ({ account }) => {
  return (
    
    // Navigation Bar
    <Navbar className='my-3'>
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">Kalina DAO</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {account} 
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>

    // Hero Image

  );
}

export default Navigation;
