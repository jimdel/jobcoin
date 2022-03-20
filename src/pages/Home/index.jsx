import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import store from '../../context/store';
import styled from "styled-components";
import ApiService from '../../api';
import { useAlert } from 'react-alert';
import Card from '../../components/Card';
import TransactionsChart from '../../components/TransactionsChart';

const HomePageHeader = styled.section`
    background: #003b6D;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .5rem;
`

const HomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    .welcome-msg {
        text-align: center;
        font-size: 1.75rem;
        padding: 1rem;
    }
    .panel-container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 2fr 1fr;
        height: 100%
    }
    .balance {
        font-size: 1.25rem;
        text-align: center;
        margin-top: 2rem;
    }

    .chart-container {
        width: 1000px;
        display: flex;
        justify-content: center;
        margin: auto;
    }
`;

const BottomPanel = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1rem;
    height: 100%;
    .card-container {
        padding: 1rem;
    }
`;

const SendForm = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    input {
        width: 300px;
        margin-bottom: 1rem;
    }
`

//  Home 
function Home() {

    // State & Misc.
    const ctx = useContext(store)
    const navigate = useNavigate()
    const alert = useAlert()
    const [recipientAddress, setRecipientAddress] = useState('')
    const [quantity, setQuantity] = useState('');

    // Methods
    const handleSendJobcoin = async (e) => {
        e.preventDefault()

       
        if (isNaN(Number(quantity))) {
            alert.error('Please enter a valid number')
            return false
        }
        
        if (!recipientAddress) {
            alert.error('Please enter a valid address')
            return false
        }

        try {
            // Send jobcoins
           await ApiService.sendJobcoin({userAddress: ctx.userAddress, recipientAddress, quantity}) 
            // Fetch & update user balance
           const updatedUserInfo = await ApiService.fetchAddressInfo(ctx.userAddress)
           ctx.setUserInfo(updatedUserInfo)
            // Fetch & update transaction history
           const updatedTransactionHistory = await ApiService.fetchTransactionHistory()
           ctx.setTransactionHistory(updatedTransactionHistory)
           setQuantity('')
           setRecipientAddress('')
           alert.success('Jobcoin sent successfully')
        } catch (error) {
            console.error(error)
            alert.error("Unable to send Jobcoin")
        }
    }

    const handleSignOut = () => { 
        ctx.handleSignOut()
        navigate('/login')
    }

    // Lifecycles
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const transactions = await ApiService.fetchTransactionHistory()
                console.log(transactions)
            
            } catch (error) {
                console.error(error)
                alert.error('Unable to fetch transactions')
            }
        }
        if (!ctx.userAddress) {
            console.log('No user address found...')
            navigate('/login')
        }
        
        fetchTransactions()
    }, [])

    return (
        <HomeContainer>
            <HomePageHeader>
            <h1 className='welcome-msg'>Welcome, {ctx.userAddress}</h1>
            <button onClick={handleSignOut}>Sign Out</button>
            </HomePageHeader>
            <div className='panel-container'>
                <div className="chart-container">
                    <TransactionsChart></TransactionsChart>
                </div>
                <BottomPanel>
                    <div className='card-container'>
                    <Card title={"Current Jobcoin Balance"}>
                        <p className='balance'>{ctx.userInfo.balance || "N/A"}</p>
                    </Card>
                    </div>
                    <div className='card-container'>
                        <Card title={"Send Jobcoin"}>
                            <SendForm onSubmit={handleSendJobcoin}>
                                <label>Recipient</label>
                                <input placeholder='Enter recipient address...' value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)}/>
                                <label>Quantity</label>
                                <input type="text" value={quantity} placeholder='Enter quantity...' onChange={(e) => setQuantity(e.target.value)}/>
                                <button onChange={handleSendJobcoin}>Send</button>
                            </SendForm>
                        </Card>
                    </div>
                    <div className='card-container'>
                        <Card title={`${ctx.userAddress}'s Transaction History`}>
                            
                        </Card>
                    </div>
                </BottomPanel>
            </div>
        </HomeContainer>
    )
}

export default Home;