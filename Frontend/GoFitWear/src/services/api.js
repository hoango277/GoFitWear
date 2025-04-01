import axios from "../services/customizeAxios"




const callHomeProduct = (page, size) =>{
    return  axios.get("/products", {
        params:{page, size}
     })
    
}

export {
    callHomeProduct
}