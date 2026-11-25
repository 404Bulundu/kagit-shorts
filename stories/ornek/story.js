// story.js — hangi kart hangi kelimede çıkacak? Her satır bir kart.
// W('kelime') = o kelimenin söylendiği saniye. Kelime script.txt'de iki kez geçiyorsa: W('kelime', 2)
// Kart türleri: baslik, kart, not, damga, sayac, resim  ·  sahne(...) = yeni ekran
import { W, sahne, baslik, kart, not, damga, sayac } from '../../engine/src/kit.js';

export default function () {
  sahne(0);
  baslik(0, 'BU VİDEO', 'KAMERASIZ');
  kart(W('çekilmedi'), '📷 Kamera yok');
  kart(W('kodla'), '⌨️ Kodla çizildi');

  sahne(W('her'));
  baslik(W('her'), 'HER KART', 'BİR KELİMEDE');
  sayac(W('yüz'), 120);
  kart(W('geliyor'), 'tam bu kelimede ↑', { renk: '#ff5a1f', yazi: '#fff' });

  sahne(W('önemli'));
  not(W('kendi'), 'Kendi konun + kendi verin');
  damga(W('para'), 'ŞABLON GİBİ = PARA YOK');

  sahne(W('hadi'));
  baslik(W('hadi'), 'SIRA SENDE', 'İLK VİDEONU YAP');
}
