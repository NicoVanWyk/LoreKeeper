import React from 'react';
import MapComponent from '../components/MapComponent';
// Icons
import CapitalCity from '../assets/Legend/Icons/CapitalCity.png';
import CityVillage from '../assets/Legend/Icons/City&Village.png';
import Fort from '../assets/Legend/Icons/Fort.png';
import Landmark from '../assets/Legend/Icons/Landmark.png';
// Aliances & Empires
import EasternFenHisan from '../assets/Legend/Alliances&Empires/EasternFenHisanEmpire.png';
import FreeStates from '../assets/Legend/Alliances&Empires/FreeStates.png';
import DalwinianAlliance from '../assets/Legend/Alliances&Empires/DalwinianAlliance.png';
import Hillgrave from '../assets/Legend/Alliances&Empires/HillgraveAlliance.png';
import Twins from '../assets/Legend/Alliances&Empires/TheTwins.png';
import Ardor from '../assets/Legend/Alliances&Empires/Ardor.png';
import Havaria from '../assets/Legend/Alliances&Empires/HavarianEmpire.png';

const MapsPage = () => {
    return (
        <div className="container">
            <h1>Interactive Map</h1>
            <MapComponent />

            <h2>Icons:</h2>
            <div className='row' style={{ gap: '20px' }}>
                <img src={CapitalCity} alt="Capital City" style={{ height: '125px' }} />
                <img src={CityVillage} alt="City Village" style={{ height: '125px' }} />
                <img src={Landmark} alt="Landmark" style={{ height: '125px' }} />
                <img src={Fort} alt="Fort" style={{ height: '125px' }} />
            </div>

            <h2>Alliances/Empires:</h2>
            <div className="row">
                <img src={EasternFenHisan} alt="Eastern Fen'Hisan Empire" style={{ height: '175px' }} />
                <img src={FreeStates} alt="Free City States" style={{ height: '175px' }} />
                <img src={DalwinianAlliance} alt="Dalwinian Alliance" style={{ height: '175px' }} />
                <img src={Hillgrave} alt="Alliance Of The Hillgraves" style={{ height: '175px' }} />
                <img src={Twins} alt="The Twins" style={{ height: '175px' }} />
                <img src={Ardor} alt="Ardoran Empire" style={{ height: '175px' }} />
                <img src={Havaria} alt="Havarian Empire" style={{ height: '175px' }} />
            </div>

            <br></br>
            <a href="https://www.flaticon.com/free-icon/houses_2109397?term=village&related_id=2109397" title="village icons">Village icons created by Freepik - Flaticon</a>
            <a href="https://www.flaticon.com/free-icon/tower_2778395?term=fortress&page=1&position=14&origin=tag&related_id=2778395" title="fortress icons">Fortress icons created by Freepik - Flaticon</a>
            <a href="https://www.flaticon.com/free-icon/monument_708104?term=monument&related_id=708104" title="monument icons">Monument icons created by Freepik - Flaticon</a>
            <a href="https://www.flaticon.com/free-icons/capital" title="castle icons">Capital icons created by Freepik - Flaticon</a>
        </div>
    );
};

export default MapsPage;