import CustomerFeedback from "../components/home/CustomerFeedBack";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";
import MostSaleProduct from "../components/home/MostSaleProduct";
import NewItemsOnSale from "../components/home/NewItemsOnSale";
import SummerSlideshow from "../components/home/SummerSlideShow";



const Home = () => {
    return <>
        <SummerSlideshow/>
        <NewItemsOnSale/>
        <MostSaleProduct/>
        <CustomerFeedback/>
    </>
}

export default Home;
