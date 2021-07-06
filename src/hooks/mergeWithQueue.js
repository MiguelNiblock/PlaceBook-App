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

const resolveQueueArray = async (endpoint,queueArray,method,remoteArray)=>{
  const promises = queueArray.map( async(item) => {
    try {
      const result = await ( async()=>{
        switch(method){
          case 'post': {
            const {data} = await api.request(  { url:endpoint, method, data:{item} }  );
            return data
          }
          case 'put': {
              //check if records still exist remotely
            const remoteItem = remoteArray.find( ({_id})=>_id===item._id );
              //check if local updates are newer than remote state
            const isNewer = remoteItem ? item.datetimeModified > remoteItem.datetimeModified : null;
              //if all of the above are true, do the update
            if ( remoteItem && isNewer ) {
              const {data} = await api.request(  {url:`${endpoint}/${item._id}`, method, data:{...item}}  );
              return data
            } else return 'unnecessary'
          }
          default: return null
        }
      })();
      
      console.log('result:',result);
      if ( result ==='unnecessary' || result._id === item._id ) {
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

export const updateDB = async (endpoint,queue,setQueue,remoteState)=>{
  console.log('updateDB called. current queue:',queue);
  
  let newQueue = {create:[],update:[],delete:[]}

  //Create queue
  const newCreateQueueP = resolveQueueArray(endpoint, queue.create, 'post');

  //Update queue
  const newUpdateQueueP = resolveQueueArray(endpoint, queue.update, 'put', remoteState);

  //Delete queue 

  //Wait for all queues to finish
  const [newCreateQueue,newUpdateQueue] = await Promise.all([newCreateQueueP,newUpdateQueueP]);
  newQueue.create = newCreateQueue;
  newQueue.update = newUpdateQueue;

  //Set new queue
  console.log('new queue:',newQueue);
  setQueue(newQueue)
  
  return true
}