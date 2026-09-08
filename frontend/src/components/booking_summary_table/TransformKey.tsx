export const transformKeys = (obj: any) => {
    return Object.keys(obj).reduce((acc:any, key) => {
      const newKey = key.replace(/_/g, " ").toLowerCase();
      const capitalizedKey:any =
        newKey.charAt(0).toUpperCase() + newKey.slice(1);
      acc[capitalizedKey] = obj[key];
      return acc;
    }, {});
  };
  export const tranfereddata=(data:any)=>{
      const newdata=(data || [])
      const newdata1=data.map(transformKeys)
      // .map(transformKeys(data));
      // console.log(newdata1,"newdatainfun")
      return newdata1
  }
  

  
  