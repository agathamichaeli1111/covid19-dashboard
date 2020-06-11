import React, {useState, useContext, useEffect} from 'react'
import {FileText, Map, BarChart2} from 'react-feather'
import {keyBy} from 'lodash'

import theme from '../../../styles/theme'
import colors from '../../../styles/colors'

import {getReport} from '../../../lib/data'

import {AppContext, ThemeContext} from '../../../pages'

import Scrollable from '../../scrollable'

import IndicatorsMaps from './indicators-maps'

import BigPictureInformations from '../big-picture/big-picture-informations'
import IndicatorsStatistics from './indicators-statistics'
import TerritoriesMobileMap from '../../territories-mobile-map'
import TerritoriesDesktopMap from '../../territories-desktop-map'

export const IndicatorsContext = React.createContext()

const MobileIndicators = () => {
  const [selectedView, setSelectedView] = useState('stats')

  const app = useContext(AppContext)
  const theme = useContext(ThemeContext)

  const views = {
    map: (
      <TerritoriesMobileMap maps={IndicatorsMaps} context={IndicatorsContext}>
        <IndicatorsStatistics />
      </TerritoriesMobileMap>
    ),
    stats: (
      <Scrollable>
        <IndicatorsStatistics />
      </Scrollable>
    ),
    informations: (
      <Scrollable>
        <BigPictureInformations />
      </Scrollable>
    )
  }

  const handleClick = view => {
    app.setSelectedLocation('FRA')
    setSelectedView(view)
  }

  return (
    <>
      <Scrollable>
        {views[selectedView]}
      </Scrollable>

      <div className='view-selector'>
        <div className={`${selectedView === 'stats' ? 'selected' : ''}`} onClick={() => handleClick('stats')}>
          <BarChart2 size={32} color={selectedView === 'stats' ? theme.primary : colors.black} />
        </div>
        <div className={`${selectedView === 'map' ? 'selected' : ''}`} onClick={() => handleClick('map')}>
          <Map size={32} color={selectedView === 'map' ? theme.primary : colors.black} />
        </div>
        <div className={`${selectedView === 'informations' ? 'selected' : ''}`} onClick={() => handleClick('informations')}>
          <FileText size={32} color={selectedView === 'informations' ? theme.primary : colors.black} />
        </div>
      </div>

      <style jsx>{`
        .view-selector {
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          justify-content: center;
          align-items: center;
          background-color: #fff;
          box-shadow: 0 -1px 4px ${colors.lightGrey};
        }

        .view-selector > div {
          padding: 0.5em;
          margin: auto;
          margin-bottom: -4px;
        }

        .view-selector > div.selected {
          border-top: 4px solid ${theme.primary};
        }
      `}</style>
    </>
  )
}

const DesktopIndicators = () => {
  return (
    <>
      <div className='menu'>
        <Scrollable>
          <>
            <IndicatorsStatistics />
            <BigPictureInformations />
          </>
        </Scrollable>
      </div>

      <div className='map'>
        <TerritoriesDesktopMap maps={IndicatorsMaps} context={IndicatorsContext} />
      </div>

      <style jsx>{`
        .menu {
          z-index: 1;
          display: flex;
          flex-direction: column;
          max-width: ${theme.menuWidth};
          box-shadow: 0 1px 4px ${colors.lightGrey};
        }

        .map {
          display: flex;
          flex: 1;
          flex-direction: column;
          height: 100%;
        }
      `}</style>
    </>
  )
}

const Indicators = props => {
  const {date, isMobileDevice} = useContext(AppContext)

  const [indicators, setIndicators] = useState([])
  const [selectedMapId, setSelectedMapId] = useState('Activité épidémique')
  const [selectedStat, setSelectedStat] = useState('tauxIncidence')

  const Component = isMobileDevice ? MobileIndicators : DesktopIndicators

  useEffect(() => {
    const mapProperties = keyBy(IndicatorsMaps, 'property')

    if (mapProperties[selectedStat]) {
      setSelectedMapId(mapProperties[selectedStat].name)
    }
  }, [selectedStat])

  useEffect(() => {
    const getIndicatorsData = async () => {
      const {history} = await getReport(date, 'DEP')
      setIndicators(history.map(dep => {
        return {
          ...dep,
          code: dep.code.split('-')[1]
        }
      }))
    }

    getIndicatorsData()
  }, [date])

  return (
    <IndicatorsContext.Provider value={{indicators, selectedMapId, setSelectedMapId, selectedStat, setSelectedStat}}>
      <Component {...props} />
    </IndicatorsContext.Provider>
  )
}

export default Indicators
