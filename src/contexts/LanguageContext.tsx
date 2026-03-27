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
  'slope': { en: 'Slope', de: 'Steigung', fr: 'Pente', ru: 'Уклон' },
  'surface': { en: 'Surface', de: 'Untergrund', fr: 'Surface', ru: 'Поверхность' },
  'category': { en: 'Category', de: 'Kategorie', fr: 'Catégorie', ru: 'Категория' },
  'heartRate': { en: 'Heart rate', de: 'Herzfrequenz', fr: 'Fréquence cardiaque', ru: 'Пульс' },
  'cadence': { en: 'Cadence', de: 'Trittfrequenz', fr: 'Cadence', ru: 'Каденс' },
  'temperature': { en: 'Temperature', de: 'Temperatur', fr: 'Température', ru: 'Температура' },
  'power': { en: 'Power', de: 'Leistung', fr: 'Puissance', ru: 'Мощность' },
  'distance': { en: 'Distance', de: 'Entfernung', fr: 'Distance', ru: 'Расстояние' },
  'elevationGain': { en: 'Elevation gain', de: 'Höhengewinn', fr: 'Dénivelé positif', ru: 'Набор высоты' },
  'elevationLoss': { en: 'Elevation loss', de: 'Höhenverlust', fr: 'Dénivelé négatif', ru: 'Потеря высоты' },
  'zoomIn': { en: 'Zoom in', de: 'Vergrößern', fr: 'Zoom avant', ru: 'Увеличить' },
  'zoomOut': { en: 'Zoom out', de: 'Verkleinern', fr: 'Zoom arrière', ru: 'Уменьшить' },
  'search': { en: 'Search', de: 'Suche', fr: 'Recherche', ru: 'Поиск' },
  'target': { en: 'Target', de: 'Ziel', fr: 'Cible', ru: 'Цель' },
  'user': { en: 'User', de: 'Benutzer', fr: 'Utilisateur', ru: 'Пользователь' },
  'layers': { en: 'Layers', de: 'Ebenen', fr: 'Couches', ru: 'Слои' },
  'navigation': { en: 'Navigation', de: 'Navigation', fr: 'Navigation', ru: 'Навигация' },
  'distanceUnits': { en: 'Distance units', de: 'Entfernungseinheiten', fr: 'Unités de distance', ru: 'Единицы расстояния' },
  'velocityUnits': { en: 'Velocity units', de: 'Geschwindigkeitseinheiten', fr: 'Unités de vitesse', ru: 'Единицы скорости' },
  'temperatureUnits': { en: 'Temperature units', de: 'Temperatureinheiten', fr: 'Unités de température', ru: 'Единицы температуры' },
  'language': { en: 'Language', de: 'Sprache', fr: 'Langue', ru: 'Язык' },
  'theme': { en: 'Theme', de: 'Thema', fr: 'Thème', ru: 'Тема' },
  'streetView': { en: 'Street view source', de: 'Street View Quelle', fr: 'Source Street View', ru: 'Источник Street View' },
  'mapLayers': { en: 'Map layers...', de: 'Kartenebenen...', fr: 'Couches de carte...', ru: 'Слои карты...' },
  'help': { en: 'Help', de: 'Hilfe', fr: 'Aide', ru: 'Помощь' },
  'donate': { en: 'Donate', de: 'Spenden', fr: 'Faire un don', ru: 'Пожертвовать' },
  'routing': { en: 'Routing', de: 'Routing', fr: 'Routage', ru: 'Маршрутизация' },
  'poi': { en: 'Points of Interest', de: 'Interessante Orte', fr: 'Points d\'intérêt', ru: 'Точки интереса' },
  'cropSplit': { en: 'Crop / Split', de: 'Zuschneiden / Teilen', fr: 'Recadrer / Diviser', ru: 'Обрезать / Разделить' },
  'time': { en: 'Time', de: 'Zeit', fr: 'Temps', ru: 'Время' },
  'merge': { en: 'Merge', de: 'Zusammenführen', fr: 'Fusionner', ru: 'Объединить' },
  'extract': { en: 'Extract', de: 'Extrahieren', fr: 'Extraire', ru: 'Извлечь' },
  'elevation': { en: 'Elevation', de: 'Höhe', fr: 'Élévation', ru: 'Высота' },
  'filter': { en: 'Filter', de: 'Filter', fr: 'Filtrer', ru: 'Фильтр' },
  'clean': { en: 'Clean', de: 'Reinigen', fr: 'Nettoyer', ru: 'Очистить' },
  'slope_legend': { en: 'Slope Legend', de: 'Steigungslegende', fr: 'Légende de pente', ru: 'Легенда уклона' },
  'steep_descent': { en: 'Steep Descent', de: 'Steiler Abstieg', fr: 'Descente raide', ru: 'Крутой спуск' },
  'descent': { en: 'Descent', de: 'Abstieg', fr: 'Descente', ru: 'Спуск' },
  'light_descent': { en: 'Light Descent', de: 'Leichter Abstieg', fr: 'Descente légère', ru: 'Лёгкий спуск' },
  'flat': { en: 'Flat', de: 'Flach', fr: 'Plat', ru: 'Равнина' },
  'light_ascent': { en: 'Light Ascent', de: 'Leichter Aufstieg', fr: 'Montée légère', ru: 'Лёгкий подъём' },
  'ascent': { en: 'Ascent', de: 'Aufstieg', fr: 'Montée', ru: 'Подъём' },
  'steep_ascent': { en: 'Steep Ascent', de: 'Steiler Aufstieg', fr: 'Montée raide', ru: 'Тяжёлый подъём' },
  'activity': { en: 'Activity', de: 'Aktivität', fr: 'Activité', ru: 'Активность' },
  'bike': { en: 'Bike', de: 'Fahrrad', fr: 'Vélo', ru: 'Велосипед' },
  'foot': { en: 'Foot', de: 'Zu Fuß', fr: 'À pied', ru: 'Пешком' },
  'car': { en: 'Car', de: 'Auto', fr: 'Voiture', ru: 'Автомобиль' },
  'allowPrivate': { en: 'Allow private roads', de: 'Privatwege erlauben', fr: 'Autoriser les routes privées', ru: 'Разрешить частные дороги' },
  'reverse': { en: 'Reverse', de: 'Umkehren', fr: 'Inverser', ru: 'Развернуть' },
  'backToStart': { en: 'Back to start', de: 'Zurück zum Start', fr: 'Retour au début', ru: 'Назад к началу' },
  'roundTrip': { en: 'Round trip', de: 'Rundreise', fr: 'Aller-retour', ru: 'Туда-обратно' },
  'name': { en: 'Name', de: 'Name', fr: 'Nom', ru: 'Имя' },
  'description': { en: 'Description', de: 'Beschreibung', fr: 'Description', ru: 'Описание' },
  'icon': { en: 'Icon', de: 'Icon', fr: 'Icône', ru: 'Иконка' },
  'link': { en: 'Link', de: 'Link', fr: 'Lien', ru: 'Ссылка' },
  'latitude': { en: 'Latitude', de: 'Breitengrad', fr: 'Latitude', ru: 'Широта' },
  'longitude': { en: 'Longitude', de: 'Längengrad', fr: 'Longitude', ru: 'Долгота' },
  'createPoi': { en: 'Create point of interest', de: 'Interessanten Ort erstellen', fr: 'Créer un point d\'intérêt', ru: 'Создать точку интереса' },
  'crop': { en: 'Crop', de: 'Zuschneiden', fr: 'Recadrer', ru: 'Обрезать' },
  'splitInto': { en: 'Split the trace into', de: 'Spur teilen in', fr: 'Diviser la trace en', ru: 'Разделить трек на' },
  'files': { en: 'Files', de: 'Dateien', fr: 'Fichiers', ru: 'Файлы' },
  'tracks': { en: 'Tracks', de: 'Tracks', fr: 'Traces', ru: 'Треки' },
  'segments': { en: 'Segments', de: 'Segmente', fr: 'Segments', ru: 'Сегменты' },
  'speed': { en: 'Speed', de: 'Geschwindigkeit', fr: 'Vitesse', ru: 'Скорость' },
  'movingTime': { en: 'Moving time', de: 'Zeit in Bewegung', fr: 'Temps de déplacement', ru: 'Время в движении' },
  'start': { en: 'Start', de: 'Start', fr: 'Début', ru: 'Старт' },
  'end': { en: 'End', de: 'Ende', fr: 'Fin', ru: 'Конец' },
  'pickDate': { en: 'Pick a date', de: 'Datum wählen', fr: 'Choisir une date', ru: 'Выбрать дату' },
  'realisticTime': { en: 'Create realistic time data', de: 'Realistische Zeitdaten erstellen', fr: 'Créer des données de temps réalistes', ru: 'Создать реалистичные данные времени' },
  'updateTime': { en: 'Update time data', de: 'Zeitdaten aktualisieren', fr: 'Mettre à jour les données de temps', ru: 'Обновить данные времени' },
  'connectTraces': { en: 'Connect the traces', de: 'Spuren verbinden', fr: 'Connecter les traces', ru: 'Соединить треки' },
  'mergeKeepDisconnected': { en: 'Merge the contents and keep the traces disconnected', de: 'Inhalte zusammenführen и Spuren getrennt halten', fr: 'Fusionner le contenu et garder les traces déconnectées', ru: 'Объединить содержимое и оставить треки разъединенными' },
  'mergeSelection': { en: 'Merge selection', de: 'Auswahl zusammenführen', fr: 'Fusionner la sélection', ru: 'Объединить выбранное' },
  'requestElevation': { en: 'Request elevation data', de: 'Höhendaten anfordern', fr: 'Demander des données d\'élévation', ru: 'Запросить данные о высоте' },
  'tolerance': { en: 'Tolerance', de: 'Toleranz', fr: 'Tolérance', ru: 'Допуск' },
  'numGpsPoints': { en: 'Number of GPS points', de: 'Anzahl der GPS-Punkte', fr: 'Nombre de points GPS', ru: 'Количество GPS точек' },
  'minify': { en: 'Minify', de: 'Minimieren', fr: 'Minifier', ru: 'Минимизировать' },
  'deleteGpsPoints': { en: 'Delete GPS points', de: 'GPS-Punkte löschen', fr: 'Supprimer les points GPS', ru: 'Удалить GPS точки' },
  'deletePoi': { en: 'Delete points of interest', de: 'Interessante Orte löschen', fr: 'Supprimer les points d\'intérêt', ru: 'Удалить точки интереса' },
  'deleteInside': { en: 'Delete inside selection', de: 'Innerhalb der Auswahl löschen', fr: 'Supprimer à l\'intérieur de la sélection', ru: 'Удалить внутри выделения' },
  'deleteOutside': { en: 'Delete outside selection', de: 'Außerhalb der Auswahl löschen', fr: 'Supprimer à l\'extérieur de la sélection', ru: 'Удалить снаружи выделения' },
  'more': { en: 'More...', de: 'Mehr...', fr: 'Plus...', ru: 'Еще...' },
  'previousBasemap': { en: 'Switch to previous basemap', de: 'Vorherige Basiskarte', fr: 'Carte de base précédente', ru: 'Предыдущая карта' },
  'toggleOverlays': { en: 'Toggle overlays', de: 'Overlays umschalten', fr: 'Basculer les superpositions', ru: 'Переключить наложения' },
  'distanceMarkers': { en: 'Distance markers', de: 'Distanzmarkierungen', fr: 'Marqueurs de distance', ru: 'Маркеры расстояния' },
  'directionArrows': { en: 'Direction arrows', de: 'Richtungspfeile', fr: 'Flèches de direction', ru: 'Стрелки направления' },
  'toggle3D': { en: 'Toggle 3D', de: '3D umschalten', fr: 'Basculer la 3D', ru: 'Переключить 3D' },
  'totalTime': { en: 'Total time', de: 'Gesamtzeit', fr: 'Temps total', ru: 'Общее время' },
  'routingFooter': { en: 'Select a trace to use the routing tool, or click on the map to start creating a new route.', de: 'Wählen Sie eine Spur aus, um das Routing-Tool zu verwenden, oder klicken Sie auf die Karte, um eine neue Route zu erstellen.', fr: 'Sélectionnez une trace pour utiliser l\'outil de routage, ou cliquez sur la carte pour commencer à créer un nouvel itinéraire.', ru: 'Выберите трек для использования инструмента маршрутизации или щелкните на карте, чтобы начать создание нового маршрута.' },
  'poiFooter': { en: 'Select a file to create or edit points of interest.', de: 'Wählen Sie eine Datei aus, um interessante Orte zu erstellen oder zu bearbeiten.', fr: 'Sélectionnez un fichier pour créer ou modifier des points d\'intérêt.', ru: 'Выберите файл для создания или редактирования точек интереса.' },
  'cropSplitFooter': { en: 'Select a trace to crop or split.', de: 'Wählen Sie eine Spur zum Zuschneiden oder Teilen aus.', fr: 'Sélectionnez une trace à recadrer ou à diviser.', ru: 'Выберите трек для обрезки или разделения.' },
  'timeFooter': { en: 'Select a single trace to manage its time data.', de: 'Wählen Sie eine einzelne Spur aus, um deren Zeitdaten zu verwalten.', fr: 'Sélectionnez une seule trace pour gérer ses données de temps.', ru: 'Выберите один трек для управления его временными данными.' },
  'mergeFooter': { en: 'Your selection must contain several traces to connect them. Tip: use Ctrl Click to add items to the selection.', de: 'Ihre Auswahl muss mehrere Spuren enthalten, um sie zu verbinden. Tipp: Verwenden Sie Strg-Klick, um Elemente zur Auswahl hinzuzufügen.', fr: 'Votre sélection doit contenir plusieurs traces pour les connecter. Conseil : utilisez Ctrl Clic pour ajouter des éléments à la sélection.', ru: 'Ваш выбор должен содержать несколько треков для их соединения. Совет: используйте Ctrl Click, чтобы добавить элементы к выбору.' },
  'extractFooter': { en: 'Your selection must contain items with multiple traces to extract them.', de: 'Ihre Auswahl muss Elemente mit mehreren Spuren enthalten, um diese zu extrahieren.', fr: 'Votre sélection doit contenir des éléments avec plusieurs traces pour les extraire.', ru: 'Ваш выбор должен содержать элементы с несколькими треками для их извлечения.' },
  'elevationFooter': { en: 'Select a file item to request elevation data.', de: 'Wählen Sie ein Dateielement aus, um Höhendaten anzufordern.', fr: 'Sélectionnez un élément de fichier pour demander des données d\'élévation.', ru: 'Выберите файл для запроса данных о высоте.' },
  'filterFooter': { en: 'Select a trace to reduce the number of its GPS points.', de: 'Wählen Sie eine Spur aus, um die Anzahl ihrer GPS-Punkte zu reduzieren.', fr: 'Sélectionnez une trace pour réduire le nombre de ses points GPS.', ru: 'Выберите трек, чтобы уменьшить количество его GPS-точек.' },
  'cleanFooter': { en: 'Clean GPS points and points of interest with a rectangle selection', de: 'GPS-Punkte und interessante Orte mit einer Rechteckauswahl löschen', fr: 'Nettoyer les points GPS et les points d\'intérêt avec une sélection rectangulaire', ru: 'Очистить GPS-точки и точки интереса с помощью прямоугольного выделения' },
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
