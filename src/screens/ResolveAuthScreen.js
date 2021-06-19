import React,{useEffect,useContext} from 'react';
import {Context as AuthContext} from '../context/AuthContext';

const ResolveAuthScreen = () => {
  
  const {tryLocalSignin} = useContext(AuthContext);
  
  useEffect( ()=>{
    // console.log('resolveAuthScreen loaded')
    tryLocalSignin();
    }, [] );
  
  return null;
};

export default ResolveAuthScreen;