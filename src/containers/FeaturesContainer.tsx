import React, { useEffect } from "react";
import { AppBar, Box, Button, Chip, Grid, IconButton, Tab, Tabs, TextField, Typography } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import ShadersListComponent from "../components/features/ShadersListComponent";
import { IEmusakEmulatorConfig, IEmusakGame, IEmusakSaves, IEmusakShaders, IRyujinxConfig } from "../types";
import { matchIdFromCustomDatabase, matchIdFromNswdb, matchIdFromTinfoil } from "../service/EshopDBService";
import SavesListComponent from "../components/features/SavesListComponent";
import AutorenewIcon from '@material-ui/icons/Autorenew';

interface IFeaturesContainerProps {
  config: IEmusakEmulatorConfig;
  onFirmwareDownload: () => void;
  onKeysDownload: () => void;
  onEmuConfigDelete: (config: IRyujinxConfig) => void;
  firmwareVersion: string;
  emusakShaders: IEmusakShaders;
  onShadersDownload: (id: string) => void;
  emusakSaves: IEmusakSaves;
  onRefresh: Function;
}

const FeaturesContainer = ({
  config,
  onFirmwareDownload,
  onKeysDownload,
  firmwareVersion,
  emusakShaders,
  onShadersDownload,
  onEmuConfigDelete,
  emusakSaves,
  onRefresh
}: IFeaturesContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const [filterTerm, setFilterTerm] = React.useState<string>(null);
  const [games, setGames] = React.useState([]);

  const filterGames = (games: IEmusakGame[]) => {
    if (!filterTerm) {
      return games;
    }

    return games.filter(g => {
      return g.name.toLowerCase().includes(filterTerm.toLowerCase());
    });
  };

  /**
   * Since we receive only title IDs from emulator config, find real title name from different databases and sort list alphabetically
   */
  useEffect(() => {
    setGames(config
      .games
      .map(g => ({
        ...g,
        name: matchIdFromCustomDatabase(g.id) || matchIdFromTinfoil(g.id) || matchIdFromNswdb(g.id) || g.id
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
    )
  }, [config]);

  const renderTab = () => {
    switch (tabIndex) {
      case 0:
        return <ShadersListComponent
          emusakShaders={emusakShaders}
          games={filterGames(games)}
          onShadersDownload={(id) => onShadersDownload(id)}
        />;
      case 1:
        return <SavesListComponent
          games={filterGames(games)}
          onSavesDownload={() => {}}
          emusakSaves={emusakSaves}
        />;
    }
  }

  return (
    <>
      <Grid container spacing={2} style={{display: 'flex', alignItems: 'center'}}>
        <Grid item xs={4}>
          <Box display="flex" justifyContent="start" alignItems="center">
            <h3 style={{lineHeight: '24px'}}>
              <IconButton
                size="small"
                color="secondary"
                component="span"
                onClick={() => onEmuConfigDelete(config)}
              >
                <DeleteOutline/>
              </IconButton>
            </h3>
            <h3><small>{config.path}</small></h3>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Button
            onClick={() => onFirmwareDownload()}
            fullWidth
            variant="contained"
            color="primary"
            disabled={!firmwareVersion}
          >
            Download firmware {firmwareVersion}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            onClick={() => onKeysDownload()}
            fullWidth
            variant="contained"
            color="primary"
            disabled={!firmwareVersion}
          >
            Download keys
          </Button>
        </Grid>
        <Grid item xs={2} style={{textAlign: 'right'}}>
          Is Portable <Chip label={config.isPortable ? 'yes' : 'no'} color="primary"/>
        </Grid>
      </Grid>

      <Box display="flex" alignItems="center">
        <Box marginRight={"12px"} style={{ position: 'relative', top: 8 }}>
          <IconButton
            size="small"
            onClick={() => onRefresh()}
            color="primary"
            aria-label="upload picture"
            component="span"
          >
            <AutorenewIcon />
          </IconButton>
        </Box>
        <Box minWidth={240}>
          <TextField
            onChange={e => setFilterTerm(e.target.value)}
            value={filterTerm || ''}
            label="Filter game list"
            type="search"
            fullWidth
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AppBar style={{marginTop: 20}} position="static">
            <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} aria-label="simple tabs example">
              <Tab label="Shaders"/>
              <Tab label="Saves"/>
              <Tab label="Mods"/>
            </Tabs>
          </AppBar>

          {renderTab()}
        </Grid>
      </Grid>
    </>
  );
}

export default FeaturesContainer;
