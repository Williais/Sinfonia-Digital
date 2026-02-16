import { Audio } from 'expo-av';

class PlayerService {

  private static currentSound: Audio.Sound | null = null;

  private static onUpdate: ((status: any) => void) | null = null;


  async play(uri: string, onUpdateCallback?: (status: any) => void) {

    if (PlayerService.currentSound) {
      await PlayerService.currentSound.unloadAsync();
      PlayerService.currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        if (onUpdateCallback) onUpdateCallback(status);
      }
    );

    PlayerService.currentSound = sound;
    PlayerService.onUpdate = onUpdateCallback || null;
    return sound;
  }

  async togglePlay() {
    if (!PlayerService.currentSound) return false;
    
    const status = await PlayerService.currentSound.getStatusAsync();
    if (!status.isLoaded) return false;

    if (status.isPlaying) {
      await PlayerService.currentSound.pauseAsync();
      return false;
    } else {
      await PlayerService.currentSound.playAsync();
      return true;
    }
  }

  async seekTo(millis: number) {
    if (PlayerService.currentSound) {
      await PlayerService.currentSound.setPositionAsync(millis);
    }
  }

  async stop() {
    if (PlayerService.currentSound) {
      await PlayerService.currentSound.unloadAsync();
      PlayerService.currentSound = null;
    }
  }
}

export const playerService = new PlayerService();