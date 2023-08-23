import React , {useState, useEffect} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import config from '../config/config';
import state from '../store';
import {download} from '../assets';
import {downloadCanvasToImage, reader} from '../config/helpers';
import {EditorTabs, FilterTabs, DecalTypes} from '../config/constants';
import { slideAnimation, fadeAnimation } from '../config/motion';
import { AIpicker, Colorpicker, CustomButton, Filepicker, Tab } from '../components';

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState(''); // to upload Images through files

  const [prompt, setPrompt] = useState(''); // for recieving and processing AI prompts
  const [generatingImg, setGeneratingImg] = useState(false); // to check if the Image is loading or not

  const [activeEditorTab, setActiveEditorTab] = useState(""); // Shows which tab we are working with  
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  }); // Shows if the current shirt shows the logo or the full decal on the shirt

  // Show Tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab){
      case "colorpicker":
        return <Colorpicker />
      
      case "filepicker":
        return <Filepicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />

      case "aipicker":
        return <AIpicker
          prompt={prompt}
          setPrompt={setPrompt}
          generatingImg={generatingImg}
          handleSubmit={handleSubmit}
        />

      default:
        return null;
    }
  }

  const handleSubmit = async (type) => {
    if(!prompt) return alert("Please enter a prompt");

    try{
      // call our backend to generate an AI image
      setGeneratingImg(true);

      const response = await fetch('http://localhost:8080/api/v1/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
        })
      })

      const data = await response.json();

      handleDecals(type, `${data.photo}`)
    }catch(error) {
      alert(error)
    }finally {
      setGeneratingImg(false);
      setActiveEditorTab("");
    }
  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if(!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab[decalType.filterTab]
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    //after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      return{
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }


  const readFile = (type) => {
    reader(file) // reads the type of file data
      .then((result) => {
        handleDecals(type, result); // handles the type of image going onto the shirt, logo / Decal
        setActiveEditorTab("")
      })
  }
  return (
      <AnimatePresence>
        {!snap.intro && (
          <>
            <motion.div key="custom" className='absolute top-0 left-0 z-10'
            {...slideAnimation('left')}>
              <div className="flex items-center min-h-screen">
                <div className="editortabs-container tabs">
                  {EditorTabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      tab={tab}
                      handleClick = {() => {setActiveEditorTab(tab.name)}}
                    />
                  ))}

                  {generateTabContent()}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute z-10 top-5 right-5" {...fadeAnimation}
            >
              <CustomButton
                 type = "filled"
                 title = "Go Back"
                 handleClick = {() => state.intro = true}
                 customStyles = "w-fit px-4 py-2.5 font-bold text-sm"
              />
            </motion.div>
            
            <motion.div
              className="filtertabs-container" {...slideAnimation('up')}
            >
              {FilterTabs.map((tab) => (
                <Tab
                  key={tab.name}
                  tab={tab}
                  isFilterTab
                  isActiveTab={activeFilterTab[tab.name]}
                  handleClick = {() => handleActiveFilterTab(tab.name)}
                 />
               ))}

            </motion.div>
          </>
        )}
      </AnimatePresence>
  )
}

export default Customizer