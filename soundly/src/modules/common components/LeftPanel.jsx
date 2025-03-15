import AccountCard from "./left panel components/AccountCard";
import NavigationPanel from "./left panel components/NavigationPanel";

const LeftPanel = () => {
    return(
        <aside class="sidebar">
             <AccountCard/>
            <NavigationPanel/> 
        </aside>
    );
}
export default LeftPanel;