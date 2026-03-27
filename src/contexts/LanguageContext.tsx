import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'de' | 'fr' | 'ru';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  'file': { en: 'File', de: 'Datei', fr: 'Fichier', ru: 'Файл' },
  'edit': { en: 'Edit', de: 'Bearbeiten', fr: 'Modifier', ru: 'Правка' },
  'view': { en: 'View', de: 'Ansicht', fr: 'Vue', ru: 'Вид' },
  'settings': { en: 'Settings', de: 'Einstellungen', fr: 'Paramètres', ru: 'Настройки' },
  'new': { en: 'New', de: 'Neu', fr: 'Nouveau', ru: 'Новый' },
  'open': { en: 'Open...', de: 'Öffnen...', fr: 'Ouvrir...', ru: 'Открыть...' },
  'duplicate': { en: 'Duplicate', de: 'Duplizieren', fr: 'Dupliquer', ru: 'Дублировать' },
  'delete': { en: 'Delete', de: 'Löschen', fr: 'Supprimer', ru: 'Удалить' },
  'deleteAll': { en: 'Delete all', de: 'Alle löschen', fr: 'Tout supprimer', ru: 'Удалить все' },
  'export': { en: 'Export...', de: 'Exportieren...', fr: 'Exporter...', ru: 'Экспорт...' },
  'exportAll': { en: 'Export all...', de: 'Alle exportieren...', fr: 'Tout exporter...', ru: 'Экспорт всех...' },
  'undo': { en: 'Undo', de: 'Rückgängig', fr: 'Annuler', ru: 'Отменить' },
  'redo': { en: 'Redo', de: 'Wiederholen', fr: 'Rétablir', ru: 'Вернуть' },
  'info': { en: 'Info...', de: 'Info...', fr: 'Infos...', ru: 'Инфо...' },
  'appearance': { en: 'Appearance...', de: 'Aussehen...', fr: 'Apparence...', ru: 'Внешний вид...' },
  'unhide': { en: 'Unhide', de: 'Einblenden', fr: 'Afficher', ru: 'Показать' },
  'selectAll': { en: 'Select all', de: 'Alle auswählen', fr: 'Tout sélectionner', ru: 'Выбрать все' },
  'center': { en: 'Center', de: 'Zentrieren', fr: 'Centrer', ru: 'Центрировать' },
  'elevationProfile': { en: 'Elevation profile', de: 'Höhenprofil', fr: 'Profil d\'élévation', ru: 'Профиль высот' },
  'distanceUnits': { en: 'Distance units', de: 'Entfernungseinheiten', fr: 'Unités de distance', ru: 'Единицы расстояния' },
  'velocityUnits': { en: 'Velocity units', de: 'Geschwindigkeitseinheiten', fr: 'Unités de vitesse', ru: 'Единицы скорости' },
  'temperatureUnits': { en: 'Temperature units', de: 'Temperatureinheiten', fr: 'Unités de température', ru: 'Единицы температуры' },
  'language': { en: 'Language', de: 'Sprache', fr: 'Langue', ru: 'Язык' },
  'theme': { en: 'Theme', de: 'Thema', fr: 'Thème', ru: 'Тема' },
  'streetView': { en: 'Street view source', de: 'Street View Quelle', fr: 'Source Street View', ru: 'Источник Street View' },
  'mapLayers': { en: 'Map layers...', de: 'Kartenebenen...', fr: 'Couches de carte...', ru: 'Слои карты...' },
  'help': { en: 'Help', de: 'Hilfe', fr: 'Aide', ru: 'Помощь' },
  'donate': { en: 'Donate', de: 'Spenden', fr: 'Faire un don', ru: 'Пожертвовать' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
