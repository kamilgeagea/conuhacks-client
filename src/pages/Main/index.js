import { useEffect, useState, useRef } from "react";
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';

import "./Main.scss";

const photos = [
    "https://seriouseats.com/thmb/e16lLOoVEix_JZTv7iNyAuWkPn8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2014__09__20140918-jamie-olivers-comfort-food-insanity-burger-david-loftus-f7d9042bdc2a468fbbd50b10d467dafd.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/800px-Hamburger_%28black_bg%29.jpg",
    "https://www.bhg.com/thmb/QXGyadcA-06uFSeV5woRVtKlFik=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/quick-poutine-BBOQQT52qRM8_P2JsdQxXI-2336ec1ff4744ee89333a3da76fd7ae3.jpg"
];

const placesDetected = [
    "Mc",
    "Za"
];

const Main = () => {
    const [isOpen, setOpen] = useState(false);
    const videoRef = useRef(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (!videoRef) return
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
            let video = videoRef.current;
            video.srcObject = stream;
            video.play();

            setInterval(() => {
                // code here
                // videoRef.current
            }, 16.7);
        });
    }, [videoRef]);

    const googleCloutFunc = async () => {
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
            //this code runs AFTER the Blob is extracted
            let fd = new FormData();
            fd.append('field-name', blob, 'image-filename.png');
            // console.log(blob);

            // //load the blob into the image tag
            // let img = document.createElement('img');
            // let url = URL.createObjectURL(blob);
            // img.addEventListener('load', (ev)=>{
            //     console.log('image from createObjectURL loaded');
            // })
            // img.src = url; //use the canvas binary png blob
            // document.getElementById('image').appendChild(img);

        //     const reader = new FileReader();
        //     reader.readAsDataURL(blob); 
        //     reader.onloadend = function() {
        //         const base64data = reader.result.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        //         console.log(base64data)
        //         axios({
        //             method: 'post',
        //             url: 'https://vision.googleapis.com/v1/images:annotate',
        //             headers: {
        //                 'Authorization': 'Bearer ya29.a0AX9GBdWRR86NgtUchgu_4R_5JfGwR-cpWNHwpT03THcmBixlyPXZx-GbIgf8OMGzdA8xR-VCJcUeJPcmRzyb4sA3YZLR2ma5d2IEk4wNvOn7e4Xzf0dLIyz3jy-S1Eeww-jB4a6Q5S-nYDI7QuontGR3Ap9Y67IbZWpundjrWIMEQEERKQ1mk51W7HMCAMgCYVOwXj2sKneMwZGO3yzGTUWz1mgrzcBy8eO4SAaCgYKAfgSARESFQHUCsbCe26s0b5rjl4Cr32rZKPjiw0237',
        //                 'x-goog-user-project': 'august-balancer-375502',
        //                 'Content-Type': 'application/json; charset= utf-8'
        //             },
        //             data: {
        //                 requests: [
        //                     {
        //                     image: {
        //                         content: base64data
        //                     },
        //                     features: [
        //                         {
        //                         type: "TEXT_DETECTION"
        //                         }
        //                     ]
        //                     }
        //                 ]
        //             }                  
        //         });
        //     }
        }, 'image/png'); //create binary png from canvas contents
    };

    const fetchMap = () => {
        axios({
            method: 'get',
            url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=45.4958091,-73.580631&radius=100&key=AIzaSyCvSWxIDZdHQfISX1pnhK8JKab6rlLrCWI',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000'
            }                
        });
    }

    return (
        <div className="main">
            <div className="display">

                {/* <button style={{ position: "absolute", top: 0 }} onClick={googleCloutFunc}>Google Cloud Button</button>
                <button style={{ position: "absolute", top: 50 }} onClick={fetchMap}>Google Maps Button</button> */}

                <div className="places-detected">
                    {placesDetected.map(placeDetected => (
                        <div key={placeDetected} className="place-detected">{placeDetected}</div>
                    ))}
                </div>

                <div id="image"></div>

                <div className={`sheet ${isOpen && "open"}`}>
                    <div className="fit-padding">
                        <div onClick={() => setOpen(!isOpen)}>
                            <div className="handle">
                                <div className="knob" />
                            </div>

                            <div className="title-row">
                                <div className="title">McDonald's</div>
                                <div className="rating">
                                    <div className="score">4.5</div>
                                    <StarIcon className="star-icon" />
                                </div>
                            </div>

                            <div className="description-row">
                                <div className="place-type">
                                    <div className="type">Restaurant</div>
                                    <div className="cost"> . $$</div>
                                </div>
                                <div className="place-status">Open</div>
                            </div>
                        </div>

                        <div className="info">
                            <LanguageIcon className="icon" />
                            <div className="text">mcdonalds.com</div>
                            
                        </div>
                        <div className="info">
                            <LocalPhoneIcon className="icon" />
                            <div className="text">514-697-2799</div>
                        </div>
                        <div className="info">
                            <QueryBuilderIcon className="icon" />
                            <div className="text">Closes 5 pm</div>
                        </div>
                        <div className="info">
                            <LocationOnIcon className="icon" />
                            <div className="text">17000 Trans-Canada Hwy, Kirkland, Quebec H9J 2M5, Canada</div>
                        </div>


                        <div className="tab-menu">
                            <div className="menu">
                                <div
                                    className={`item ${tab === 0 && "active"}`}
                                    onClick={() => setTab(0)}
                                >Photos</div>
                                <div
                                    className={`item ${tab === 1 && "active"}`}
                                    onClick={() => setTab(1)}
                                >About</div>
                            </div>
                        </div>

                    </div>

                    {tab === 0 && (<div className="photos">
                        {photos.map(photo => (
                            <img key={photo} src={photo} />
                        ))}
                    </div>)}

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
            <canvas id="canvas"></canvas>
        </div>
    );
};

export default Main;