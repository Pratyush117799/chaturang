package com.pratyush.chaturanga.di

import android.content.Context
import com.pratyush.chaturanga.data.LessonRepository
import com.pratyush.chaturanga.data.PreferencesDataStore
import com.pratyush.chaturanga.data.PuzzleRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun providePreferencesDataStore(@ApplicationContext context: Context): PreferencesDataStore =
        PreferencesDataStore(context)

    @Provides
    @Singleton
    fun providePuzzleRepository(@ApplicationContext context: Context): PuzzleRepository =
        PuzzleRepository(context)

    @Provides
    @Singleton
    fun provideLessonRepository(): LessonRepository = LessonRepository()
}
