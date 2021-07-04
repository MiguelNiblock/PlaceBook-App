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

export const updateDB = async (queue,createQueueRemove)=>{
  console.log('updateDB called. current queue:',queue);
  //for each item in queue, try to update DB. on success, remove from queue
  
  //Create queue
  // const {data} = await api.post('/lists/many',queue);
  // console.log('data:',data);
  // data.create && resetCreate()
}