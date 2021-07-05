import api from '../api/location';

export const mergeWithQueue = (data,queue)=>{
  //apply queued operations to data

  //Delete ops
  let syncedData = data.filter(({_id})=>{
    return !queue.delete.includes(_id)
  })

  //Update ops
  syncedData = syncedData.map(remoteItem => {
    const localUpdate = queue.update.find(({_id})=>_id === remoteItem._id);
    if (localUpdate){
      return localUpdate.datetimeModified > remoteItem.datetimeModified ? localUpdate : remoteItem
    } else return remoteItem
  });
  
  //Create ops
  syncedData = [...syncedData,...queue.create]

  console.log('syncedData:',syncedData);
  return syncedData
}

const resolveQueueArray = async (endpoint,queueArray)=>{
  const promises = queueArray.map( async(item) => {
    try {
      const {data} = await api.post(endpoint,{item});
      console.log('response:',data);
      if (data) {
        return false
      } else return true
    } catch(error){
      console.error('error:',error);
      return true
      }
  } );
  const results = await Promise.all(promises);
  return queueArray.filter( (value,index)=> results[index] )
}

export const updateDB = async (endpoint,queue,setQueue)=>{
  console.log('updateDB called. current queue:',queue);
  
  let newQueue = {create:[],update:[],delete:[]}

  //Create queue
  const newCreateQueueP = resolveQueueArray(endpoint, queue.create);

  //Update queue

  //Delete queue 

  //Wait for all queues to finish
  const [newCreateQueue] = await Promise.all([newCreateQueueP]);
  newQueue.create = newCreateQueue;

  //Set new queue
  console.log('new create queue:',newQueue.create);
  setQueue(newQueue)
  
  return true
}