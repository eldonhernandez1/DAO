import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';

const Create = ({ provider, dao, setIsLoading }) => {
	const[name, setName] = useState('')
	const[amount, setAmount] = useState(0)
	const[address, setAddress] = useState('')
	const [isWaiting,setIsWaiting] = useState(false)

	const createHandler = async (e) => {
		e.preventDefault()
		setIsWaiting(true)

		try {
			const signer = await provider.getSigner()
			const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')

			const transaction = await dao.connect(signer).createProposal(name, formattedAmount, address)
			await transaction.wait()

		} catch {
			window.alert('User rejected or transaction reverted')
		}

			setIsLoading(true)
	}

	return(
		<Form onSubmit={createHandler}>
			<Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
				<Form.Control 
					type='text' 
					placeholder='Enter the name of the proposal' 
					className='my-2'
					onChange={(e) => setName(e.target.value)}
				/>
				
				<Form.Control 
					type='number' 
					placeholder='Enter the amount of the proposal' 
					className='my-2'
					onChange={(e) => setAmount(e.target.value)}
				/>
				<Form.Control 
					type='address' 
					placeholder='Enter address you&rsquo;re going to send the proposal' 
					className='my-2'
					onChange={(e) => setAddress(e.target.value)}
				/>
				{isWaiting ? (
					<Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
					) : (
					   <Button variant='primary' type='submit' style={{ width: '100%', margin: '20px auto',  }}>
					   	Create Proposal
					   </Button>
					)}
			</Form.Group>
		</Form>
	)
}

export default Create;
