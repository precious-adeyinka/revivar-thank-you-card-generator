/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {useState, useEffect, MouseEvent} from 'react';

import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [images, setImages] = useState<any[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const fetchImages = async () => {
    setLoading(true);
  
    const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
  
    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${unsplashApiKey}&orientation=portrait&count=4`);
      const data = await response.json();
      if (data?.length > 0) {
        const startIndex = Math.floor(Math.random() * (data.length - 4));
        const selectedImages = data.slice(startIndex, startIndex + 4);
        setImages(selectedImages.map((img: any) => img));
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (event: MouseEvent, image: string) => {
    const randImgs = document.querySelectorAll(".randImg");
    randImgs.forEach(randImg => randImg?.parentElement?.classList.remove("ring-2", "ring-white"));
    setSelectedImage(image);
    event.currentTarget.parentElement?.classList.add("ring-2", "ring-white");
    createCanvasImg()
    const generateBtn = document.getElementById("generate-btn")
    generateBtn?.scrollIntoView({behavior: 'smooth'})

    // switch the preview to image
    const previewImage = document.getElementById("preview-image")
    const previewCanvas = document.getElementById("preview-canvas")
    previewImage?.classList.remove("hidden")
    previewCanvas?.classList.add("hidden")
  };
  
  const createCanvasImg = () => {
    const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    const previewImage = document.getElementById('preview-image') as HTMLImageElement;
  
    if (canvas && previewImage) {
      const ctx = canvas.getContext('2d');
  
      if (previewImage.complete) {
        // Clear the canvas before re-drawing
        ctx!.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = previewImage.naturalWidth;
        canvas.height = previewImage.naturalHeight;
        ctx!.drawImage(previewImage, 0, 0, previewImage.naturalWidth, previewImage.naturalHeight);
      } else {
        previewImage.onload = () => {
          canvas.width = previewImage.naturalWidth;
          canvas.height = previewImage.naturalHeight;
          ctx!.drawImage(previewImage, 0, 0, previewImage.naturalWidth, previewImage.naturalHeight);
        };
      }
    }
  };
  
  const downloadCard = (canvas: HTMLCanvasElement) => {
    const link = document.getElementById('download-card') as HTMLAnchorElement;
    if(link) {
      link.download = 'thank-you-card.png';
      link.href = canvas.toDataURL('image/png');
      link.classList.remove("hidden")
    }
  }

  const generateThankYouCard = (imageUrl: string, userName: string) => {
    const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const image = document.getElementById("preview-image") as HTMLImageElement;
  
    // Set the canvas dimensions based on a 4:5 aspect ratio
    const canvasWidth = window.innerWidth * 0.8; // Width is 80% of viewport width
    const canvasHeight = canvasWidth * 5 / 4;  // Height is determined by 4:5 aspect ratio
  
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  
    // Clear the canvas before re-drawing
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
  
    // Adjust image dimensions to fit within the canvas while maintaining its aspect ratio
    let imgWidth = canvasWidth;
    let imgHeight = (image.naturalHeight / image.naturalWidth) * imgWidth;
  
    // If the height exceeds the canvas height, adjust width to maintain aspect ratio
    if (imgHeight > canvasHeight) {
      imgHeight = canvasHeight;
      imgWidth = (image.naturalWidth / image.naturalHeight) * imgHeight;
    }
  
    // Center the image
    const x = (canvasWidth - imgWidth) / 2;
    const y = (canvasHeight - imgHeight) / 2;
  
    ctx!.drawImage(image, x, y, imgWidth, imgHeight);
  
    // Set default font sizes
    let fontSize = 98;
    let userNameFontSize = 58;
    let offsetThankYou = 90;
    let offsetUserName = 30;
  
    // Adjust font sizes for mobile screens
    if (window.innerWidth <= 768) {
      fontSize = 48;
      userNameFontSize = 28;
      offsetThankYou = 50;
      offsetUserName = 25;
    }
  
    // Draw "Thank You" text at the top
    ctx!.font = `${fontSize}px bold sans-serif`;
    ctx!.fillStyle = 'white';
    ctx!.textAlign = 'center';
    ctx!.fillText('Thank You', canvasWidth / 2, offsetThankYou);
  
    // Draw user's name at the bottom
    ctx!.font = `${userNameFontSize}px sans-serif`;
    ctx!.fillText(userName, canvasWidth / 2, canvasHeight - offsetUserName);
  
    // Convert the canvas to a data URL
    const dataUrl = canvas.toDataURL('image/png');
    image.src = dataUrl;
  
    return canvas;
  };  

  const generateCard = () => {
    if (!selectedImage) return;

    const errorText = document.getElementById("errorText")
    if(!userName && userName.length === 0) {
      errorText?.classList.remove("hidden")
      if (errorText) errorText.textContent = "Username is required"
      const link = document.getElementById('download-card') as HTMLAnchorElement;
      if(link) link.classList.add("hidden")
    }
    else {
      errorText?.classList.add("hidden")
      if(errorText) errorText.textContent = ""
      const canvas = generateThankYouCard(selectedImage, userName);
      downloadCard(canvas);

      // switch the preview to canvas
      const previewImage = document.getElementById("preview-image")
      const previewCanvas = document.getElementById("preview-canvas")
      previewImage?.classList.add("hidden")
      previewCanvas?.classList.remove("hidden")
    }
  };

  useEffect(() => {
    fetchImages()
  }, [])

  return (
    <div className="min-h-screen md:h-screen w-full flex flex-col items-center justify-start bg-black px-3 md:px-10 py-5 overflow-y-auto">
      <div className="h-auto w-11/12 bg-transparent flex flex-col items-center justify-start">
        <h1 className="text-4xl md:text-9xl font-bold text-white font-light leading-lose text-center ">Explore.Create.Share</h1>
        <p className="text-md md:text-2xl text-white/70 mt-2 font-thin leading-snug text-center w-10/12 md:w-full">Create beautiful thank you cards for friends and families.</p>
        <p className="text-sm text-blue-200 mt-2 font-thin leading-snug text-center">Click on an image below</p>

        {/* gallery */}
        <div className="h-full w-full grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 mt-10">
          <div className={`h-full w-full bg-transparent grid grid-cols-2 gap-5 ${selectedImage && selectedImage?.length > 1 ? 'md:col-span-1' : 'md:col-span-3'}`}>
            {
              loading ? (
                <div className="h-full w-full flex items-center justify-center col-span-3">
                  <div className="h-10 w-10 rounded-full border-2 border-grey-500 border-t-blue-500 animate-spin"></div>
                </div>
              ) : null
            }

            {
              !loading && images && images.map((image, id) =>  {
                return (
                  <div
                  className='h-52 md:h-80 w-full flex items-center justify-center rounded-lg position relative overflow-hidden bg-white/5 cursor-pointer transition-all duration-300'
                  key={id}
                  >
                    <Image
                      className="object-cover h-full w-full randImg"
                      src={image?.urls?.regular}
                      alt={image.alt_description}
                      layout='fill'
                      objectFit='cover'
                      priority
                      onClick={(e: MouseEvent) => {
                        handleImageClick(e, image?.urls?.regular)
                      }}
                    />
                  </div>
                )
              })
            }
          </div>
          {
            selectedImage && selectedImage.length > 1 ? (
            <div className="h-full w-full bg-transparent grid grid-cols-1 md:grid-cols-3 gap-y-5 md:gap-10 overflow-hidden md:col-span-2">
              {/* preview */}
              <div id="preview-card" className='min-h-[20vh] max-h-[80vh] w-full md:w-4/5 aspect-w-4 aspect-h-5 aspect-[4/5] bg-transparent rounded-lg flex items-center justify-center position relative overflow-hidden col-span-2'>
                {
                  selectedImage && selectedImage.length > 1 ? (
                    <>
                      <Image
                        id="preview-image"
                        className="object-cover h-full w-full randImg"
                        src={selectedImage}
                        layout='fill'
                        objectFit='cover'
                        priority
                        alt="card image"
                      />

                      <canvas
                        id="preview-canvas"
                        className="hidden object-cover h-full w-full randImg"
                      />
                    </>
                  ) : (
                    <p className='text-xs text-white font-medium'>Your Card Preview</p>
                  )
                }
              </div>
             
              {/* form */}
              <div className='h-full w-full flex flex-col items-center justify-center space-y-4'>
                <h2 className='text-lg text-white font-bold'>Recipient&lsquo;s Name</h2>
                <input 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                type="text" 
                placeholder='Your Name' 
                className='h-12 w-full border border-blue-500 rounded-md bg-white/5 px-4 focus:outline-none placeholder:text-xs placeholder:text-gray-500 text-sm text-white' />
                {/* error text */}
                <p id="errorText" className='hidden text-xs text-red-500'></p>

                <button 
                onClick={generateCard}
                id="generate-btn"
                className='h-12 w-full flex items-center justify-center text-white rounded-lg bg-blue-500 text-sm font-medium'>
                  Generate Card
                </button>

                <a id="download-card" className='hidden h-12 w-full flex items-center justify-center text-white rounded-lg bg-green-500 text-sm font-medium'>
                  Download Card
                </a>
              </div>
            </div>
            ) : null
          }
        </div>
      </div>
    </div>
  );
}
