import api from '../api/location';

export const mergeWithQueue = (data,queue)=>{
  //apply queued operations to data

  //Delete ops
  const deleteIds = queue.delete.map(item=>item._id);
  let syncedData = data.filter(({_id})=>{
    return !deleteIds.includes(_id)
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
          case 'delete': {
            const remoteItem = remoteArray.find( ({_id})=>_id===item._id );
            if (remoteItem){
              const {data} = await api.request(  {url:`${endpoint}/${item._id}`, method }  );
              return data
            } else return 'unnecessary'
          }
          default: return null
        }
      })();
      
      console.log(`${method} ${endpoint} result:`,result);
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
  console.log(`updateDB called. current "${endpoint}" queue:`,queue);
  
  let newQueue = {create:[],update:[],delete:[]}

  //Create queue
  const newCreateQueueP = resolveQueueArray(endpoint, queue.create, 'post');
  //Update queue
  const newUpdateQueueP = resolveQueueArray(endpoint, queue.update, 'put', remoteState);
  //Delete queue 
  const newDeleteQueueP = resolveQueueArray(endpoint, queue.delete, 'delete', remoteState);

  //Wait for all queues to finish and set to new queue
  const [newCreateQueue,newUpdateQueue,newDeleteQueue] = await Promise.all([newCreateQueueP,newUpdateQueueP,newDeleteQueueP]);
  newQueue.create = newCreateQueue;
  newQueue.update = newUpdateQueue;
  newQueue.delete = newDeleteQueue;

  //Set new queue
  console.log(`new "${endpoint}" queue:`,newQueue);
  setQueue(newQueue)
  
  return true
}