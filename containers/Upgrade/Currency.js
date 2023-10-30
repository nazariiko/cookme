import Translate from "../../components/Translate/Index";

const Currency = (props) => {
        let price = props.package && props.package.price ? props.package.price : props.price
        
        if(!parseFloat(price)){
            price = 0
        }


        let currency = props.pageData.appSettings.payment_default_currency;
        if(currency == "MNT"){
            return price+" ₮"
        }

        return new Intl.NumberFormat(props.language ? props.language : "en", {
            style: 'currency',
            currency: currency
          }).format(price);
}


export default Currency;