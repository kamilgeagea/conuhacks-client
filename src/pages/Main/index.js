import { useEffect, useState, useRef } from "react";
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import stringSimilarity from "string-similarity";
import {  } from "@react-google-maps/api";

import "./Main.scss";

const used = [];

const photos = [
    "https://seriouseats.com/thmb/e16lLOoVEix_JZTv7iNyAuWkPn8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2014__09__20140918-jamie-olivers-comfort-food-insanity-burger-david-loftus-f7d9042bdc2a468fbbd50b10d467dafd.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/800px-Hamburger_%28black_bg%29.jpg",
    "https://www.bhg.com/thmb/QXGyadcA-06uFSeV5woRVtKlFik=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/quick-poutine-BBOQQT52qRM8_P2JsdQxXI-2336ec1ff4744ee89333a3da76fd7ae3.jpg"
];

function randomIntFromInterval(min, max) { // min and max included 
    return Math.random() * (max - min + 1) + min
  }

const Main = () => {
    const [isOpen, setOpen] = useState(false);
    const videoRef = useRef(null);
    const [tab, setTab] = useState(0);
    const [detections, setDetections] = useState([]);
    const [currentPlace, setCurrentPlace] = useState(null);

    useEffect(() => {
        if (!videoRef) return
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
            let video = videoRef.current;
            video.srcObject = stream;
            video.play();
        });
    }, [videoRef]);

    useEffect(() => {
        axios({
            method: "get",
            url: "https://api.geoapify.com/v2/places?categories=catering,commercial,accommodation,education,childcare,entertainment,healthcare,rental,service,amenity,ski,activity&filter=circle:-73.57769911783691,45.495842959494865,300&bias=proximity:-73.57769911783691,45.495842959494865&limit=500&apiKey=6c7cdd89d74a4aa0936ed60483946fe6"
        })
        .then(res => {
            setInterval(() => {
                googleCloutFunc(res.data.features);
            }, 2000);
        });
    }, []);

    const findMatches = (wordsFound, nearbyPlaces) => {
        wordsFound = wordsFound ? wordsFound.map(word => word.toLowerCase()) : "";

        for (let i = 0; i < wordsFound.length; i++) {
            for (let j = 0; j < nearbyPlaces.length; j++) {
                const wordFound = wordsFound[i];
                const nearbyPlace = nearbyPlaces[j].properties.name ? nearbyPlaces[j].properties.name.toLowerCase() : "00000000000000";

                if (stringSimilarity.compareTwoStrings(wordFound, nearbyPlace) >= 0.7) {
                    setDetections(detections => detections.find(detection => detection.properties.place_id === nearbyPlaces[j].properties.place_id) ? detections : [{
                        ...nearbyPlaces[j],
                        rating: randomIntFromInterval(3,4).toFixed(2),
                        website: nearbyPlace.replace(/\s/g, '').toLowerCase(),
                        number: "514-" + (Math.floor(Math.random() * 10) + 1).toString() + (Math.floor(Math.random() * 10) + 1).toString() + (Math.floor(Math.random() * 10) + 1).toString() + "-" + (Math.floor(Math.random() * 10) + 1).toString() + (Math.floor(Math.random() * 10) + 1).toString() +(Math.floor(Math.random() * 10) + 1).toString() +(Math.floor(Math.random() * 10) + 1).toString(),
                    }, ...detections]);
                    break;
                }
            }
        }
    };

    const googleCloutFunc = async (places) => {
        // Convert current frame to image
        let player = document.getElementById('webcam');
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = player.videoWidth;
        canvas.height = player.videoHeight;
        ctx.drawImage(player, 0, 0);
        let imgdata = ctx.getImageData(0,0, canvas.width, canvas.height);
        let len = imgdata.data.length;
        for(let i=0; i<len; i=i+4){
            let red = imgdata.data[i];
            let green = imgdata.data[i+1];
            let blue = imgdata.data[i+2];
            let lum = (red + green + blue)/3;
            imgdata.data[i] = lum;
            imgdata.data[i+1] = lum;
            imgdata.data[i+2] = lum;
        }
        ctx.putImageData(imgdata, 0, 0);
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob); 
            reader.onloadend = function() {
                const base64data = reader.result.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                axios({
                    method: 'post',
                    url: 'https://vision.googleapis.com/v1/images:annotate',
                    headers: {
                        'Authorization': 'Bearer ya29.a0AX9GBdVA1JtcvQ5DGHtBSt6LsPQ-1rmmPtswUSOU1td3jP13l7KXihV3u44RtOBPE2MYbppUI3PC49vB5tda5sTZZ-rISrzYFqVAxlkoTrILDblIGc6wq2NNB5cPEPDNs35xvlvYbTQwaNHS5k0yJ5S1R6N3pYNmCctueFI0Ag2M5mFq_K7ZGD_SUAAa35sM_ctdvONCwF6QBZq0D_rBAJ1aBbocA1iRSkuEWnwaCgYKAUoSARESFQHUCsbCDyIMx-0N9bJ1kM5WgXWHDw0238',
                        'x-goog-user-project': 'august-balancer-375502',
                        'Content-Type': 'application/json; charset= utf-8'
                    },
                    data: {
                        requests: [
                            {
                            image: {
                                content: base64data
                            },
                            features: [
                                {
                                type: "TEXT_DETECTION"
                                }
                            ]
                            }
                        ]
                    }                  
                }).then(res => {
                    const potentialMatches = res.data.responses[0].fullTextAnnotation ? res.data.responses[0].fullTextAnnotation.text.split("\n") : "";
                    console.log("potential matches", potentialMatches)
                    console.log("places", places)
                    findMatches(potentialMatches, places);
                });
            }
        }, 'image/png'); //create binary png from canvas contents
    };

    return (
        <div className="main">
            <div className="display">

                <div className="places-detected">
                    {detections.map((detection, idx) => (idx < 5) && (
                        <div
                            key={detection.properties.place_id}
                            className="place-detected"
                            onClick={() => {
                                setCurrentPlace(detection)
                            }}
                        >{detection.properties.name}</div>
                    ))}
                </div>

                <div id="image"></div>

                <div className={`sheet ${currentPlace ? 'visible' : ""} ${isOpen ? "open" : ""}`}>
                    <div className="fit-padding">
                        <div onClick={() => setOpen(!isOpen)}>
                            <div className="handle">
                                <div className="knob" />
                            </div>

                            <div className="title-row">
                                <div className="title">{currentPlace && (currentPlace.properties.name ? currentPlace.properties.name : "")}</div>
                                <div className="rating">
                                    <div className="score">{currentPlace && currentPlace.rating}</div>
                                    <StarIcon className="star-icon" />
                                </div>
                            </div>

                            <div className="description-row">
                                <div className="place-type">
                                    <div className="type">{"Store"}</div>
                                    <div className="cost"> . $$</div>
                                </div>
                                <div className="place-status">Open</div>
                            </div>
                        </div>

                        <div className="info">
                            <LanguageIcon className="icon" />
                            <div className="text">{currentPlace && currentPlace.website}.ca</div>
                            
                        </div>
                        <div className="info">
                            <LocalPhoneIcon className="icon" />
                            <div className="text">{currentPlace && currentPlace.number}</div>
                        </div>
                        <div className="info">
                            <QueryBuilderIcon className="icon" />
                            <div className="text">Closes 5 pm</div>
                        </div>
                        <div className="info">
                            <LocationOnIcon className="icon" />
                            <div className="text">{currentPlace && (currentPlace.properties.address_line2 ? currentPlace.properties.address_line2 : "")}</div>
                        </div>

                    </div>

                    {tab === 1 && <div className="fit-padding">Classic, long-running fast-food chain known for its burgers & fries.</div>}
                </div>
            </div>

            <video
                id="webcam"
                autoPlay={true}
                playsInline={true}
                muted={true}                
                width={window.innerWidth}
                height={window.innerHeight}
                ref={videoRef}
            />
            <canvas style={{ display: "none" }} id="canvas"></canvas>
        </div>
    );
};

export default Main;