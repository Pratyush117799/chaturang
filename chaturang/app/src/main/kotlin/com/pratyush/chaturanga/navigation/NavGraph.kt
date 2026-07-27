package com.pratyush.chaturanga.navigation

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.pratyush.chaturanga.model.GameResult
import com.pratyush.chaturanga.model.GameConfig
import com.pratyush.chaturanga.ui.screens.*

@Composable
fun ChaturangaNavGraph(
    navController: NavHostController
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash,
        enterTransition = { fadeIn(animationSpec = tween(300)) },
        exitTransition = { fadeOut(animationSpec = tween(300)) },
        popEnterTransition = { fadeIn(animationSpec = tween(300)) },
        popExitTransition = { fadeOut(animationSpec = tween(300)) }
    ) {
        composable<Screen.Splash>(
            enterTransition = { EnterTransition.None },
            exitTransition = { fadeOut(animationSpec = tween(500)) }
        ) {
            SplashScreen(
                onNavigateToMenu = {
                    navController.navigate(Screen.MainMenu) {
                        popUpTo(Screen.Splash) { inclusive = true }
                    }
                }
            )
        }

        composable<Screen.MainMenu> {
            MainMenuScreen(
                onModeSelect = { navController.navigate(Screen.ModeSelect) },
                onPuzzles = { navController.navigate(Screen.PuzzleMenu) },
                onLessons = { navController.navigate(Screen.LessonMenu) },
                onLanLobby = { navController.navigate(Screen.LanLobby) },
                onSettings = { navController.navigate(Screen.Settings) }
            )
        }

        composable<Screen.ModeSelect> {
            ModeSelectScreen(
                onStartGame = { mode, botDifficulty ->
                    navController.navigate(
                        Screen.Game(
                            mode = mode,
                            botDifficulty = botDifficulty
                        )
                    )
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.Game> { backStackEntry ->
            val gameArgs = backStackEntry.toRoute<Screen.Game>()
            GameScreen(
                config = GameConfig(
                    mode = gameArgs.mode,
                    botDifficulty = gameArgs.botDifficulty,
                    lanServerUrl = gameArgs.lanServerUrl,
                    lanRoomId = gameArgs.lanRoomId
                ),
                onGameOver = { result ->
                    navController.navigate(
                        Screen.Result(
                            winnerId = result.winnerId,
                            winnerName = result.winnerName,
                            turnCount = result.turnCount,
                            dharmaScore = result.dharmaScore,
                            captures = result.captures,
                            mode = result.mode
                        )
                    ) {
                        // Pop the game screen so backing out from results goes to main menu
                        popUpTo(Screen.Game) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.Result> { backStackEntry ->
            val resultArgs = backStackEntry.toRoute<Screen.Result>()
            ResultScreen(
                result = GameResult(
                    winnerId = resultArgs.winnerId,
                    winnerName = resultArgs.winnerName,
                    turnCount = resultArgs.turnCount,
                    dharmaScore = resultArgs.dharmaScore,
                    captures = resultArgs.captures,
                    mode = resultArgs.mode
                ),
                onPlayAgain = {
                    navController.navigate(Screen.ModeSelect) {
                        popUpTo(Screen.Result) { inclusive = true }
                    }
                },
                onMainMenu = {
                    navController.navigate(Screen.MainMenu) {
                        popUpTo(Screen.Result) { inclusive = true }
                    }
                }
            )
        }

        composable<Screen.PuzzleMenu> {
            PuzzleMenuScreen(
                onPuzzleSelected = { puzzle ->
                    navController.navigate(Screen.PuzzleGame(puzzle.id))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.PuzzleGame> { backStackEntry ->
            val args = backStackEntry.toRoute<Screen.PuzzleGame>()
            PuzzleGameScreen(
                puzzleId = args.puzzleId,
                onSolved = { puzzleId, turns ->
                    // Navigate to Result screen on solved
                    navController.navigate(
                        Screen.Result(
                            winnerId = 0, // Red always wins / solves
                            winnerName = "Warrior",
                            turnCount = turns,
                            dharmaScore = 100, // perfect score
                            captures = 0,
                            mode = "puzzle"
                        )
                    ) {
                        popUpTo(Screen.PuzzleGame) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.LessonMenu> {
            LessonMenuScreen(
                onLessonSelected = { lesson ->
                    navController.navigate(Screen.Lesson(lesson.id))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.Lesson> { backStackEntry ->
            val args = backStackEntry.toRoute<Screen.Lesson>()
            LessonScreen(
                lessonId = args.lessonId,
                onComplete = {
                    navController.navigate(Screen.LessonMenu) {
                        popUpTo(Screen.Lesson) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.LanLobby> {
            LanLobbyScreen(
                onHost = { navController.navigate(Screen.HostLobby) },
                onJoin = { navController.navigate(Screen.JoinLobby) },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.HostLobby> {
            HostLobbyScreen(
                onRoomCreated = { roomId ->
                    navController.navigate(Screen.Room(roomId = roomId, isHost = true))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.JoinLobby> {
            JoinLobbyScreen(
                onRoomJoined = { roomId ->
                    navController.navigate(Screen.Room(roomId = roomId, isHost = false))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.Room> { backStackEntry ->
            val args = backStackEntry.toRoute<Screen.Room>()
            RoomScreen(
                roomId = args.roomId,
                isHost = args.isHost,
                onMatchStarted = { roomId, serverUrl ->
                    navController.navigate(
                        Screen.Game(
                            mode = "lan_client",
                            lanServerUrl = serverUrl,
                            lanRoomId = roomId
                        )
                    ) {
                        popUpTo(Screen.Room) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable<Screen.Settings> {
            SettingsScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
