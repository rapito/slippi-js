import fs from "fs";
import _ from "lodash";

import { SlippiGame } from "../src";

it("should correctly return game settings", () => {
  const game = new SlippiGame("slp/sheik_vs_ics_yoshis.slp");
  const settings = game.getSettings()!;
  expect(settings.stageId).toBe(8);
  expect(_.first(settings.players)?.characterId).toBe(0x13);
  expect(_.last(settings.players)?.characterId).toBe(0xe);
  expect(settings.slpVersion).toBe("0.1.0");
});

it("should correctly return stats", () => {
  const game = new SlippiGame("slp/test.slp");
  const stats = game.getStats()!;
  expect(stats.lastFrame).toBe(3694);

  // Test stocks
  // console.log(stats);
  expect(stats.stocks.length).toBe(5);
  expect(_.last(stats.stocks)?.endFrame).toBe(3694);

  // Test conversions
  // console.log(stats.events.punishes);
  expect(stats.conversions.length).toBe(10);
  const firstConversion = _.first(stats.conversions)!;
  expect(firstConversion.moves.length).toBe(4);
  expect(_.first(firstConversion.moves)?.moveId).toBe(15);
  expect(_.last(firstConversion.moves)?.moveId).toBe(17);

  // Test action counts
  expect(stats.actionCounts[0].wavedashCount).toBe(16);
  expect(stats.actionCounts[0].wavelandCount).toBe(1);
  expect(stats.actionCounts[0].airDodgeCount).toBe(3);

  // Test attack counts
  expect(stats.actionCounts[0].attackCount.ftilt).toBe(3);
  expect(stats.actionCounts[0].attackCount.dash).toBe(1);
  expect(stats.actionCounts[0].attackCount.fsmash).toBe(4);
  expect(stats.actionCounts[0].attackCount.bair).toBe(4);

  // Test overall
  expect(stats.overall[0].inputCounts.total).toBe(494);
});

it("should return empty placings for older slp files", () => {
  const game = new SlippiGame("slp/test.slp");
  const placements = game.getStats()!.placements!;
  // Test Placements
  expect(placements).toHaveLength(4);
  // Expect empty placements
  expect(placements[0].position).toBe(null);
  expect(placements[1].position).toBe(null);
  expect(placements[2].position).toBe(null);
  expect(placements[3].position).toBe(null);
});

it("should correctly determine player placings", () => {
  // Test Placements
  const game = new SlippiGame("slp/placementsTest/ffa_1p2p_winner_2p.slp");
  const placements = game.getStats()!.placements!;
  expect(placements).toHaveLength(4);
  expect(placements[0].position).toBe(1); // player in port 1 is on second place
  expect(placements[0].playerIndex).toBe(0);
  expect(placements[1].position).toBe(0); // player in port 2 is on first place
  expect(placements[1].playerIndex).toBe(1);
});

it("should correctly return metadata", () => {
  const game = new SlippiGame("slp/test.slp");
  const metadata = game.getMetadata()!;
  expect(metadata.startAt).toBe("2017-12-18T21:14:14Z");
  expect(metadata.playedOn).toBe("dolphin");
});

it("should correctly return file path", () => {
  const game = new SlippiGame("slp/test.slp");
  expect(game.getFilePath()).toBe("slp/test.slp");

  const empty_game = new SlippiGame(new Buffer(""));
  expect(empty_game.getFilePath()).toBe(null);
});

it("should be able to read incomplete SLP files", () => {
  const game = new SlippiGame("slp/incomplete.slp");
  const settings = game.getSettings()!;
  expect(settings.players.length).toBe(2);
  game.getMetadata();
  game.getStats();
});

it("should be able to read nametags", () => {
  const game = new SlippiGame("slp/nametags.slp");
  const settings = game.getSettings()!;
  expect(settings.players[0].nametag).toBe("AMNイ");
  expect(settings.players[1].nametag).toBe("");

  const game2 = new SlippiGame("slp/nametags2.slp");
  const settings2 = game2.getSettings()!;
  expect(settings2.players[0].nametag).toBe("A1=$");
  expect(settings2.players[1].nametag).toBe("か、9@");

  const game3 = new SlippiGame("slp/nametags3.slp");
  const settings3 = game3.getSettings()!;
  expect(settings3.players[0].nametag).toBe("B  R");
  expect(settings3.players[1].nametag).toBe(".  。");
});

it("should be able to read netplay names and codes", () => {
  const game = new SlippiGame("slp/finalizedFrame.slp");
  const players = game.getMetadata()!.players!;
  expect(players[0].names!.netplay).toBe("V");
  expect(players[0].names!.code).toBe("VA#0");
  expect(players[1].names!.netplay).toBe("Fizzi");
  expect(players[1].names!.code).toBe("FIZZI#36");
});

it("should be able to read console nickname", () => {
  const game = new SlippiGame("slp/realtimeTest.slp");
  const nickName = game.getMetadata()?.consoleNick;
  expect(nickName).toBe("Day 1");
});

it("should support PAL version", () => {
  const palGame = new SlippiGame("slp/pal.slp");
  const ntscGame = new SlippiGame("slp/ntsc.slp");

  expect(palGame.getSettings()?.isPAL).toBe(true);
  expect(ntscGame.getSettings()?.isPAL).toBe(false);
});

it("should correctly distinguish between different controller fixes", () => {
  const game = new SlippiGame("slp/controllerFixes.slp");
  const settings = game.getSettings()!;
  expect(settings.players[0].controllerFix).toBe("Dween");
  expect(settings.players[1].controllerFix).toBe("UCF");
  expect(settings.players[2].controllerFix).toBe("None");
});

it("should be able to support reading from a buffer input", () => {
  const buf = fs.readFileSync("slp/sheik_vs_ics_yoshis.slp");
  const game = new SlippiGame(buf);
  const settings = game.getSettings()!;
  expect(settings.stageId).toBe(8);
  expect(_.first(settings.players)?.characterId).toBe(0x13);
  expect(_.last(settings.players)?.characterId).toBe(0xe);
});

it("should be able to support reading from an array buffer input", () => {
  const buf = fs.readFileSync("slp/sheik_vs_ics_yoshis.slp");
  const arrayBuf = buf.buffer;
  const game = new SlippiGame(arrayBuf);
  const settings = game.getSettings()!;
  expect(settings.stageId).toBe(8);
  expect(_.first(settings.players)?.characterId).toBe(0x13);
  expect(_.last(settings.players)?.characterId).toBe(0xe);
});

it("should extract gecko list", () => {
  // This code will contain every code listed here:
  // https://github.com/project-slippi/slippi-ssbm-asm/blob/adf85d157dbc1cbeff1e81d4d2d2ec83cad61852/Output/InjectionLists/list_netplay.json
  const game = new SlippiGame("slp/geckoCodes.slp");
  const geckoList = game.getGeckoList();
  expect(geckoList?.codes.length).toBe(457);
  expect(geckoList?.codes?.[0]?.address).toBe(0x8015ee98);
});

it("should support realtime parsing", () => {
  const fullData = fs.readFileSync("slp/realtimeTest.slp");
  const buf = Buffer.alloc(100e6); // Allocate 100 MB of space
  const game = new SlippiGame(buf);

  let data,
    copyPos = 0;

  const getData = () => ({
    settings: game.getSettings(),
    frames: game.getFrames(),
    metadata: game.getMetadata(),
    gameEnd: game.getGameEnd(),
    stats: game.getStats(),
    latestFrame: game.getLatestFrame(),
  });

  const copyBuf = (len: number): void => {
    const res = fullData.copy(buf, copyPos, copyPos, copyPos + len);
    copyPos += res;
  };

  // Test results with empty buffer
  data = getData();
  expect(data.settings).toBe(null);

  // Add the header and 0x35 command to buffer
  copyBuf(0x1d);
  data = getData();

  // Copy settings
  copyBuf(0x1a3);
  data = getData();
  expect(data.settings.stageId).toBe(8);

  // Copy first 3 frames
  copyBuf(0xe8 * 3);
  data = getData();
  expect(_.size(data.frames)).toBe(3);
  expect(data.latestFrame.frame).toBe(-122); // Eventually this should be -121
  expect(data.stats.stocks[1].endFrame).toBe(null);

  // Load the rest of the game data
  copyBuf(0x8271b);
  data = getData();
  expect(_.size(data.frames)).toBe(2306);
  expect(data.stats.lastFrame).toBe(2182);
  expect(data.gameEnd.gameEndMethod).toBe(7);
  expect(data.latestFrame.frame).toBe(2182);
  expect(data.stats.stocks[1].endFrame).toBe(766);

  // Load metadata
  copyBuf(0xa7);
  data = getData();
  expect(data.metadata.playedOn).toBe("network");
});

it("should count rollback frames properly", () => {
  const game = new SlippiGame("slp/rollbackFrameTest.slp");
  const rollbackFrames = game.getRollbackFrames();
  const rollbackLengths = rollbackFrames.lengths;
  expect(rollbackFrames.count).toBe(4292);
  expect(rollbackLengths.reduce((a, b) => a + b) / rollbackLengths.length).toBe(1.6877703499803383); // average rollback length check
});

it("should find winners in free for all", () => {
  const game = new SlippiGame("slp/placementsTest/ffa_1p2p_winner_2p.slp");
  const placements = game.getWinners();
  expect(placements).toHaveLength(1);
  expect(placements[0].playerIndex).toBe(1);
  expect(placements[0].position).toBe(0);
});

it("should find winners in teams", () => {
  const game = new SlippiGame("slp/placementsTest/teams_time_p3_redVSp1p2_blueVSp4_green_winner_blue.slp");
  const settings = game.getSettings()!;
  const placements = game.getWinners();
  expect(placements).toHaveLength(2);
  expect(placements[0].playerIndex).toBe(0);
  expect(placements[0].position).toBe(1);
  expect(settings.players[0]?.teamId).toBe(1);
  expect(placements[1].playerIndex).toBe(1);
  expect(placements[1].position).toBe(0);
  expect(settings.players[1].teamId).toBe(1);
});

it("should parse placements properly", () => {
  let game = new SlippiGame("slp/placementsTest/ffa_1p2p3p_winner_3p.slp");
  let placements = game.getGameEnd()?.placements!;
  expect(placements).toBeDefined();
  expect(placements).toHaveLength(4);

  expect(placements[0].playerIndex).toBe(0);
  expect(placements[1].playerIndex).toBe(1);
  expect(placements[2].playerIndex).toBe(2);
  expect(placements[3].playerIndex).toBe(3);

  expect(placements[0].position).toBe(1); // Expect player 1 to be on second place
  expect(placements[1].position).toBe(2); // Expect player 2 to be on third place
  expect(placements[2].position).toBe(0); // Expect player 3 to be first place
  expect(placements[3].position).toBe(-1); // Expect player 4 to not be present

  game = new SlippiGame("slp/placementsTest/ffa_1p2p4p_winner_4p.slp");
  placements = game.getGameEnd()?.placements!;
  expect(placements).toBeDefined();
  expect(placements).toHaveLength(4);

  expect(placements[0].playerIndex).toBe(0);
  expect(placements[1].playerIndex).toBe(1);
  expect(placements[2].playerIndex).toBe(2);
  expect(placements[3].playerIndex).toBe(3);

  expect(placements[0].position).toBe(1); // Expect player 1 to be on second place
  expect(placements[1].position).toBe(2); // Expect player 2 to be on third place
  expect(placements[2].position).toBe(-1); // Expect player 3 to not be present
  expect(placements[3].position).toBe(0); // Expect player 4 to be first place

  game = new SlippiGame("slp/placementsTest/teams_p1p2_blueVSp4_green_winner_green.slp");
  let settings = game.getSettings()!;
  placements = game.getGameEnd()?.placements!;
  expect(placements).toBeDefined();
  expect(placements).toHaveLength(4);

  expect(placements[0].playerIndex).toBe(0);
  expect(placements[1].playerIndex).toBe(1);
  expect(placements[2].playerIndex).toBe(2);
  expect(placements[3].playerIndex).toBe(3);

  expect(placements[0].position).toBe(1); // Expect player 1 to be on second place
  expect(placements[1].position).toBe(2); // Expect player 2 to be on third place
  expect(placements[2].position).toBe(-1); // Expect player 3 to not be present
  expect(placements[3].position).toBe(0); // Expect player 4 to be first place

  expect(settings?.players[0]?.teamId).toBe(1); // Expect player 1 to be on team blue
  expect(settings?.players[1]?.teamId).toBe(1); // Expect player 2 to be on team blue
  expect(settings?.players[2]?.teamId).toBe(2); // Expect player 4 to be on team green

  // Based on scores (time), not stock
  game = new SlippiGame("slp/placementsTest/teams_time_p3_redVSp1p2_blueVSp4_green_winner_blue.slp");
  settings = game.getSettings()!;
  placements = game.getGameEnd()?.placements!;
  expect(placements).toBeDefined();
  expect(placements).toHaveLength(4);

  expect(placements[0].playerIndex).toBe(0);
  expect(placements[1].playerIndex).toBe(1);
  expect(placements[2].playerIndex).toBe(2);
  expect(placements[3].playerIndex).toBe(3);

  expect(placements[0].position).toBe(1); // Expect player 1 to be on second place
  expect(placements[1].position).toBe(0); // Expect player 2 to be on first place
  expect(placements[2].position).toBe(3); // Expect player 3 to be on fourth place
  expect(placements[3].position).toBe(2); // Expect player 4 to be on third place

  expect(settings.players[0].teamId).toBe(1); // Expect player 1 to be on team blue
  expect(settings.players[1].teamId).toBe(1); // Expect player 2 to be on team blue
  expect(settings.players[2].teamId).toBe(0); // Expect player 3 to be on team red
  expect(settings.players[3].teamId).toBe(2); // Expect player 4 to be on team green
});

// it('test speedReadTest', () => {
//   const replayPath = "D:\\Slippi\\Tournament-Replays\\Smash-in-Wittenberg-5";

//   const dirContents = fs.readdirSync(replayPath, {
//     withFileTypes: true,
//   }) || [];

//   // Loop through and upload all of the slp files
//   _.forEach(dirContents, (folder) => {
//     if (!folder.isDirectory()) {
//       return;
//     }

//     console.log(folder.name);
//     const subPath = path.join(replayPath, folder.name);
//     const subDirContents = fs.readdirSync(subPath, {
//       withFileTypes: true,
//     }) || [];

//     // Iterate for files now
//     _.forEach(subDirContents, (file) => {
//       if (!file.isFile()) {
//         return;
//       }

//       if (path.extname(file.name) !== ".slp") {
//         return;
//       }

//       const filePath = path.join(subPath, file.name);

//       const game = new SlippiGame(filePath);
//       game.getMetadata();
//     });
//   });
// });
