import React, { useState, useEffect } from 'react';
import MLM from '../contract/MLM';
import TOKEN from '../contract/Token';
import MLMnew from "../contract/MLMnew";
import ClientTOKEN from "../contract/ClientToken";
import USDTTOKEN from "../contract/USDTToken";
import { ToastContainer, toast } from 'react-toastify';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { errors, providers } from 'ethers';
import bigInt from 'big-integer';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [handleWithdrawLoader, setHandleWithdrawLoader] = useState(false);
  const [userWithdrawBalance, setUserWithdrawBalance] = useState(0);
  const [userValid, setUserValid] = useState(false);
  const [tokenPrice, setTokePrice] = useState(0);
  const [show, setShow] = useState(false);
  const [popUpwithdrawValue, setPopupWithdrawValue] = useState('');
  const [popUpClaimValue, setPopupClaimValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [buttonStatus, setButtonStatus] = useState('approve');
  const [toggleCard, setToggleCard] = useState('deposit');
  const [regbuttonStatus, setRegButtonStatus] = useState('');
  const [depositAmount, setDepositamount] = useState(0);
  const [approveBtn, setApproveBtn] = useState(true);
  const [refId, setRefId] = useState('')
  const [enterAddress, setEnterAddress] = useState('');
  const handleClose = () => setShow(false);
  const handleShow = () => {
    console.log('handle show withdraw');
    setShow(true);

    getPopUpValue();
  };

  useEffect(() => {

    handleUrl()
    return () => {

    }
  }, [])

  const handleUrl = () => {
    console.log("handle url")
    try {
      let url = window.location.href;
      console.log("url",url);
      let id = url.split('=')[1]
      setRefId(id)
      console.log("🚀 ~ handleUrl ~ id", id)
      console.log("🚀 ~ handleUrl ~ url", url)

    } catch (error) {
      console.log("🚀 ~ handleUrl ~ error", error)

    }

  };

  // const web3Provider = new providers.Web3Provider(provider);

  useEffect(() => {
    if (userAddress) {
      getUserWalletBalance();
      getUserStatus();
    }
    return () => { };
  }, [userAddress]);

  const handleWalletConnect = async () => {
    // try {
    //   await provider.enable();
    // } catch (error) {}
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
          } else {
            console.error(err);
          }
        });
      return true;
    } else {
      console.log('Please connect to MetaMask.');
      return false;
    }
  };
  function handleAccountsChanged(accounts) {
    let currentAccount;

    if (window.ethereum) {
      if (window.ethereum.networkVersion !== '56') {
        toast.error('Please connect to Binance Mainnet');
      }
    }

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      // console.log("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      setUserAddress(currentAccount);

      // Do any other work!
    }
  }
  //
  const getPopUpValue = async () => {
    try {
      let fetchWIthdrawBalanceHalfValue = await axios
        .get(
          `https://polygonlive.org/dashboard/api/withdrawal_balance.php?address1=${userAddress}`
        )
        .then((res, err) => {
          if (err) throw err;
          console.log(res, 'res');
          return res;
        });

      let _w = fetchWIthdrawBalanceHalfValue.data.split(',')[1];
      let w = _w.split(':')[1];
      console.log('🚀 ~ handleWithdraw ~ w', w);

      console.log(
        '🚀 ~ handleWithdraw ~ fetchWIthdrawBalanceHal',
        fetchWIthdrawBalanceHalfValue
      );

      let amount = Math.round(withdrawValue);
      console.log('amount', amount);
      let _popWithdraw = (amount * w) / 100;
      let _popCalimValue = amount - _popWithdraw;
      setPopupWithdrawValue(_popWithdraw);
      setPopupClaimValue(_popCalimValue);
    } catch (error) { }
  };
  const handleWithdraw = async () => {
    // handleClose();
    if (!userAddress) {
      return toast.error('Please connect Metamask first.');
    }

    if (withdrawValue > userWithdrawBalance) {
      return toast.error('Amount should not be greater than Balance.');
    }
    console.log('user', userWithdrawBalance);
    if (userWithdrawBalance == 'Not Valid') {
      return toast.error('Insufficient balance to withdraw!.');
    }
    // let fetchWIthdrawBalanceHalfValue = await axios
    //   .get(
    //     `https://sssworld.live/dashboard/api/usd_balance.php?address=${userAddress}`
    //   )
    //   .then((res, err) => {
    //     if (err) throw err;
    //     console.log(res, 'res');
    //     return res;
    //   });

    setHandleWithdrawLoader(true);
    try {
      // let _w = fetchWIthdrawBalanceHalfValue.data.split(',')[1];
      // let w = _w.split(':')[1];
      // console.log('🚀 ~ handleWithdraw ~ w', w);

      let amount = withdrawValue;

      let value = bigInt(amount * 10 ** 18);

      const withdraw = await MLM.withdrawFund(value.toString());

      const waitforTx = await withdraw.wait();
      if (waitforTx) {
        setHandleWithdrawLoader(false);
        toast.success('Withdraw successful.');
        let withdraw = axios
          .post(
            `
            https://sssworld.live/dashboard/api/redeem.php?address=${userAddress}&amount=${withdrawValue}
`
          )
          .then((res, err) => {
            if (res) {
              getUserWalletBalance();
              return res;
            }
            if (err) {
              console.log(err);
            }
          });
      }
    } catch (error) {
      console.log(error);
      setHandleWithdrawLoader(false);
      toast.error('Something went wrong.');
    }
  };

  const getUserStatus = async () => {

    try {

      if (!userAddress) {
        return toast.error('Connect Wallet first!');
      }
      
    
    
      let _handleLogin = await MLMnew.userLogin();
      if (_handleLogin) {
        setRegButtonStatus('userLogged');
    }
      
       
      
    } catch (error) {
      console.log(error);
       let parse = JSON.stringify(error);
      let _par = JSON.parse(parse);
      console.log( _par);
     
    }

  }; 


  const getUserWalletBalance = async () => {
    try {


      let url = `https://sssworld.live/dashboard/api/balance.php?address=${userAddress}`;
      let bal = await axios.get(url).then((res, err) => {
        if (err) {
          setUserValid(false);
          console.log('err', err);
        }
        if (res) {
          console.log('🚀 ~ bal ~ res', res);
          setUserValid(true);
          return res;
        }
      });
      console.log('🚀 ~ bal ~ bal', bal);
      if (bal.data == 'Not Valid') {
        setUserWithdrawBalance(0);
      } else {
        setUserWithdrawBalance(bal.data);
      }
    } catch (error) {
      console.log("🚀 ~ getUserWalletBalance ~ error", error)

    }
  };

  const handleUserLogin = async () => {
    console.log('handle login');
    try {
      if (!userAddress) {
        return toast.error('Connect Wallet first!');
      }
      setButtonStatus('login');
      // let _handleLogin = await MLM.userLogin();
      // if (_handleLogin) {
        let _logi = await axios.get(
          `https://metabitclub.com/dashboard/b59c67bf196a4758191e42f76670cebaAPI/login.php?address=${userAddress}`
        );
        
        console.log('🚀 ~ handleUserLogin ~ _logi', _logi);
        console.log('🚀 ~ handleUserLogin ~ _logi', _logi?.data[1]?.split(':')[1]);
        let status=_logi?.data[1]?.split(':')[1]
        if (status == 200) {
          // setIsValid(true);
          if (window) {

            window?.location?.replace(`https://metabitclub.com/dashboard/home.php?address=${userAddress}`)
          }
          toast.success('Login success!');
          setButtonStatus('');
        } else {
          throw new Error('Not registered');
        }
      // }
    } catch (error) {
      console.log('🚀 ~ handleUserLogin ~ error', error);
      let parse = JSON.stringify(error);
      let _par = JSON.parse(parse);
      console.log("🚀 ~ handleUserLogin ~ _par", _par)
      toast.error('Please register yourself!');
      setButtonStatus('');
    }
  };


  const handleUserLoginNew = async () => {
    console.log('handle login');
    try {
      if (!userAddress) {
        return toast.error('Connect Wallet first!');
      }
      setButtonStatus('login');
      let _handleLogin = await MLMnew.userLogin();
      if (_handleLogin) {
        
          toast.success('Login success!');
          setButtonStatus('');
        
     }
    } catch (error) {
      console.log('🚀 ~ handleUserLogin ~ error', error);
      let parse = JSON.stringify(error);
      let _par = JSON.parse(parse);
      console.log("🚀 ~ handleUserLogin ~ _par", _par)
      toast.error('Please register yourself!');
      setButtonStatus('');
    }
  };
  const handleUserRegister = async () => {
    console.log('handle register');
    try {
      if (!userAddress) {
        return toast.error('Connect Wallet first!');
      }
      setButtonStatus('register');
        console.log(refId);
        let _reg =await axios.get(
          `https://metabitclub.com/dashboard/b59c67bf196a4758191e42f76670cebaAPI/register.php?address=${userAddress}&refid=${refId}`
        );
        console.log("register check");

        toast.success('Register success!');

        setButtonStatus('');
      // }
    } catch (error) {
      let parse = JSON.stringify(error);
      let _par = JSON.parse(parse);
      if (_par?.reason) {
        toast.error(_par?.reason);
      }
      console.log('🚀 ~ handleUserRegister ~ _par', _par);
      setButtonStatus('');
    }
  };


  const handleUserRegisterNew = async () => {
    console.log('handle register');
    


    try {
      if (!userAddress) {
        return toast.error('Connect Wallet first!');
      }
      setButtonStatus('register');
    let _buy = await MLMnew.userRegister();

      let waitForTx = await _buy.wait();
      if (waitForTx) {  
  
    
        
        console.log("register check");

        toast.success('Register success!');

        setButtonStatus('');
      }
    } catch (error) {
      let parse = JSON.stringify(error);
      let _par = JSON.parse(parse);
      if (_par?.reason) {
        toast.error(_par?.reason);
      }
      console.log('🚀 ~ handleUserRegister ~ _par', _par);
      setButtonStatus('');
    }
  };

  const _handleApprove = async () => {
    try {
      setButtonStatus('approve');
      let depostiAm = bigInt(depositAmount * 10 ** 18);
      console.log('🚀 ~ const_handleApprove= ~ depostiAm', depostiAm);
      console.log(
        '🚀 ~ const_handleApprove=async ~ depositAmount',
        depositAmount
      );
      console.log('MLM', MLM.address);
      let add = MLM.address;
      let _amount = await TOKEN.approve(add, depostiAm.toString());
      let _wait = await _amount.wait();
      if (_wait) {
        setButtonStatus('');
        setApproveBtn(false);

        toast.success('Approve success!');
      }
    } catch (error) {
      setButtonStatus('');
      setApproveBtn(true);

      console.log('🚀 ~ const_handleApprove=async ~ error', error);
      toast.error('Something went wrong!');
    }
  };

  
  const _handleDeposit = async () => {
    try {
      setButtonStatus('deposit');
      let depostiAm = bigInt(depositAmount * 10 ** 18);

      let _deposit = await MLM.depositFund(depostiAm.toString());
      let _wait = await _deposit.wait();
      if (_wait) {
        let depositApi = await axios.get(
          `https://sssworld.live/dashboard/api/topup.php?address=${userAddress}&amount=${depositAmount}`
        );
        console.log('🚀 ~ const_handleDeposit= ~ depositApi', depositApi);
        setButtonStatus('');
        setApproveBtn(false);
        toast.success('Deposit success!');
        getUserWalletBalance();
      }
    } catch (error) {
      let _par = JSON.stringify(error);
      let _parse = JSON.parse(_par);
      if (_parse?.reason) {
        toast.error(_parse?.reason);
      } else {
        toast.error('Something went wrong!');
      }
      console.log('🚀 ~ const_handleDeposit= ~ _parse', _parse);

      setButtonStatus('');
      console.log('🚀 ~ const_handleDeposit= ~ error', error);
    }
  };
  useEffect(() => {
    getAdmin();
    return () => { };
  }, [userAddress]);

  const getAdmin = async () => {
    console.log("🚀 ~ getAdmin ~ userAddress", userAddress)
    try {
      if (userAddress) {
        let owner = await MLM.owner();
        console.log('🚀 ~ getAdmin ~ owner', owner);
        console.log('🚀 ~ getAdmin ~ userAddress', userAddress);
        if (userAddress.toLowerCase() == owner.toLowerCase()) {
          console.log('valid');
          setIsOwner(true);
        }
      }

    } catch (error) {
      console.log('🚀 ~ getAdmin ~ error', error);
    }
  };

  return (
    <>
      <ToastContainer autoClose={3000} />
      <div className=''>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='logo'></div>
            </div>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-12  d-flex justify-content-center'>
          {isOwner ? (
            <Link
              to={'/admin'}
              className='dashBoard wallet  btn btn-outline border-white text-white withdrawButton'
            >
              Admin
            </Link>
          ) : (
            ''
          )}
        </div>
      </div>

      {/* handle address  */}

      {/* handle login  */}
      {!isValid ? (
        <div className='container -fluid '>
          <div className='row mt-5'>
            <div className='col-12'>
              <div className='row d-flex justify-content-center'>
                <div
                  className='col-lg-5 col-md-8  p-4 m-2 shadow2 rounded-1 '
                  style={{
                  //  backgroundColor: 'rgb(20 21 51)',#292b2c,#0275d8', linear-gradient(to top, #09203f 0%, #537895 100%)
                  backgroundColor: ' #2B4162'
                  

                  }}
                >
                  <div className='col py-4 '>
                    <div className='row'>
                      <div className='col-md-12 d-flex justify-content-center'>
                        <img
                          src='https://metabitclub.com/images/navLogo.png'
                          // className="img-fluid"
                          alt='metabitclub'
                          loading='lazy'
                          // height={150}
                          className='myImg'
                        />
                      </div>
                    </div>
                    <div className='row py-3'>
                      <div className='col-md-12 d-flex justify-content-center '>
                        {userAddress ? (
                          <button
                            className='dashBoard wallet  btn btn-outline border-white text-white withdrawButton'
                            // onClick={handleWalletConnect}

                            disabled
                            style={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              width: '160px',
                              whiteSpace: 'nowrap',
                              color: 'black',
                            }}
                          >
                            {' '}
                            {userAddress}
                          </button>
                        ) : (
                          <button
                            className=' wallet2'
                            onClick={handleWalletConnect}
                          >
                            {' '}
                            Connect Wallet{' '}
                          </button>
                        )}
                      </div>
                    </div>
                    {regbuttonStatus === '' ? (
                        <>
                    <div className='row py-3'>
                      <div className='col-12 d-flex  justify-content-center'>
                        <input
                          type='text'
                          class='form-control'
                          id='exampleFormControlInput1'
                          disabled
                          value={userAddress}
                          placeholder=' Wallet Address'
                        />
                      </div>
                      <div className='col pt-2'>
                          <label htmlFor='input ' className='pb-2'>
                            {' '}
                            Enter Token  Amount
                          </label>
                          <input
                            style={{
                              backgroundColor: '#D9D9D9',
                              borderRadius: '5px',
                              color: '#2f323b ',
                              fontWeight: '500',
                              fontSize: '18px',
                            }}
                            className='form-control '
                            type='text'
                            placeholder='Enter Token  Value'
                            aria-label='default input example'
                            value={depositAmount}
                            onChange={(e) => setDepositamount(e.target.value)}
                          />
                        </div>
                    </div>
                    </>
                     ) : (
                      ''
                    )}
                    <br/>

                    <div className='row'>
                      <div className='col d-flex justify-content-center'>
                        {buttonStatus === 'login' ? (
                          <div
                            class='spinner-border text-success'
                            role='status'
                          >
                            <span class='visually-hidden'>Loading...</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleUserLoginNew}
                            className='btn btn-outline border-white text-white withdrawButton'
                          >
                            Login
                          </button>
                        )}
                      </div>
                      <div className='col d-flex justify-content-center'>
                      {regbuttonStatus === '' ? (
                        <>
                        {buttonStatus === 'register' ? (
                          <div
                            class='spinner-border text-success'
                            role='status'
                          >
                            <span class='visually-hidden'>Loading...</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleUserRegisterNew}
                            className='btn btn-outline border-white text-white withdrawButton'
                          >
                            Register
                          </button>
                        )}
                         </>
                     ) : (
                      ''
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}

      {/* withdraw  */}
      {isValid ? (
        <div className='container mt-5'>
          <div className='container '>
            <div className='row d-flex justify-content-center'>
              <div
                className='col-lg-5 col-md-8  p-2 m-2 shadow2 rounded-1'
                style={{
                  backgroundColor: 'rgb(20 21 51)',
                }}
              >
                <div className='row'>
                  <div className='col d-flex justify-content-center'>
                    <button
                      onClick={() => setToggleCard('deposit')}
                      className={`btn btn-outline border-white text-white ${toggleCard === 'deposit'
                        ? 'activeButton'
                        : 'withdrawButton'
                        }`}
                    >
                      DEPOSIT
                    </button>
                  </div>
                  <div className='col d-flex justify-content-center'>
                    <button
                      onClick={() => setToggleCard('withdraw')}
                      className={`btn btn-outline border-white text-white ${toggleCard === 'withdraw'
                        ? 'activeButton'
                        : 'withdrawButton'
                        }`}
                    >
                      WITHDRAW
                    </button>
                  </div>
                </div>

                {toggleCard === 'deposit' ? (
                  <div className='row'>
                    <div className='col py-4 '>
                      <div className='row '>
                        <div className='col-12'>
                          <h2 className='text-center pb-4'>DEPOSIT</h2>
                        </div>
                        <div className='col-12 '>
                          <p
                            className='ps-2  border mx-3 py-2 '
                            style={{
                              backgroundColor: '#D9D9D9',
                              borderRadius: '5px',
                              color: '#2f323b ',
                              fontWeight: '500',
                              fontSize: '20px',
                            }}
                          >
                            (My Balance) - ({userWithdrawBalance}
                            {' SSCOIN'})
                          </p>
                        </div>
                      </div>
                      <div className='row  mx-2 '>
                        <div className='col pt-2'>
                          <label htmlFor='input ' className='pb-2'>
                            {' '}
                            Enter Amount
                          </label>
                          <input
                            style={{
                              backgroundColor: '#D9D9D9',
                              borderRadius: '5px',
                              color: '#2f323b ',
                              fontWeight: '500',
                              fontSize: '18px',
                            }}
                            className='form-control '
                            type='text'
                            placeholder='Enter Value'
                            aria-label='default input example'
                            value={depositAmount}
                            onChange={(e) => setDepositamount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='row   pb-4'>
                      <div className='dashBoard dashBoard2 pt-4 text-center'>
                        <>
                          {console.log('buttton', buttonStatus)}
                          {approveBtn ? (
                            <>
                              {buttonStatus === 'approve' ? (
                                <div
                                  class='spinner-border text-success'
                                  role='status'
                                >
                                  <span class='visually-hidden'>
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className={`btn btn-outline border-white text-white  withdrawButton`}
                                  onClick={_handleApprove}
                                // onClick={handleShow}
                                >
                                  APPROVE
                                </button>
                              )}{' '}
                            </>
                          ) : (
                            ''
                          )}
                          {!approveBtn ? (
                            <>
                              {buttonStatus === 'deposit' ? (
                                <div
                                  class='spinner-border text-success'
                                  role='status'
                                >
                                  <span class='visually-hidden'>
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className={`btn btn-outline border-white text-white  withdrawButton`}
                                  onClick={_handleDeposit}
                                // onClick={handleShow}
                                >
                                  Deposit
                                </button>
                              )}{' '}
                            </>
                          ) : (
                            ''
                          )}
                        </>
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {toggleCard === 'withdraw' ? (
                  <div className='row'>
                    <div className='col py-4 '>
                      <div className='row '>
                        <div className='col-12'>
                          <h2 className='text-center pb-4'>WITHDRAWAL</h2>
                        </div>
                        <div className='col-12 '>
                          <p
                            className='ps-2  border mx-3 py-2 '
                            style={{
                              backgroundColor: '#D9D9D9',
                              borderRadius: '5px',
                              color: '#2f323b ',
                              fontWeight: '500',
                              fontSize: '20px',
                            }}
                          >
                            (My Balance) - ({userWithdrawBalance}
                            {' SSCOIN'})
                          </p>
                        </div>
                      </div>
                      <div className='row  mx-2 '>
                        <div className='col pt-2'>
                          <label htmlFor='input ' className='pb-2'>
                            {' '}
                            Enter Amount
                          </label>
                          <input
                            style={{
                              backgroundColor: '#D9D9D9',
                              borderRadius: '5px',
                              color: '#2f323b ',
                              fontWeight: '500',
                              fontSize: '18px',
                            }}
                            className='form-control '
                            type='text'
                            placeholder='Enter Value'
                            aria-label='default input example'
                            value={withdrawValue}
                            onChange={(e) => setWithdrawValue(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='row   pb-4'>
                      <div className='dashBoard dashBoard2 pt-4 text-center'>
                        <>
                          {!handleWithdrawLoader ? (
                            <button
                              className='btn btn-outline border-white text-white withdrawButton'
                              onClick={handleWithdraw}
                            // onClick={handleShow}
                            >
                              Withdraw
                            </button>
                          ) : (
                            <div
                              class='spinner-border text-success'
                              role='status'
                            >
                              <span class='visually-hidden'>Loading...</span>
                            </div>
                          )}
                        </>
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>

          {handleWithdrawLoader ? (
            <div
              className='alert alert-warning bg-danger text-light'
              role='alert'
            >
              Don't refresh the page, otherwise you lost your money.
            </div>
          ) : (
            ''
          )}

          {/* <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                <h4 className='text-dark'>Transaction </h4>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className='text-dark'>Are you sure ?</p>
              <p className='text-dark'>Withdraw Value {popUpwithdrawValue}</p>
              <p className='text-dark'>Claim Value {popUpClaimValue} </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='danger' onClick={handleClose}>
                Reject
              </Button>
              <Button variant='primary' onClick={handleWithdraw}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal> */}
        </div>
      ) : (
        ''
      )}
    </>
  );
}
