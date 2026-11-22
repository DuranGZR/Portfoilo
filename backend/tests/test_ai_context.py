import copy
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app.services import ai_service


class ApprovedProfileTests(unittest.TestCase):
    def test_current_facts_and_featured_projects(self):
        profile = ai_service.load_knowledge_base()
        self.assertEqual(profile['about']['gpa'], '2.87/4.0')
        self.assertIn('2027', profile['about']['year'])
        self.assertEqual(profile['community_activities'][0]['title'], 'DevOps Developer')
        featured = [p for p in profile['projects'] if p.get('featured')]
        self.assertEqual(len(featured), 6)
        site = json.loads((Path(__file__).resolve().parents[2] / 'frontend/messages/tr.json').read_text(encoding='utf-8'))
        self.assertEqual({p['name'] for p in featured}, {p['title'] for p in site['projects']['items'].values()})
        self.assertEqual(len(profile['certifications']), 6)
        self.assertEqual(profile['languages'][1]['level'], 'B1')
        self.assertEqual(profile['achievements'][0]['result'], '5. sıra')

    def test_prompt_includes_contacts_and_has_no_stale_claims(self):
        prompt = ai_service.get_system_prompt()
        for value in ['AskDocs', 'Noktiq', 'contact@durangezer.com', 'linkedin.com/in/durangezer', '/cv/Duran_Gezer_CV_TR.pdf', '/cv/Duran_Gezer_CV_EN.pdf']:
            self.assertIn(value, prompt)
        for value in ['Anlık Anlatım', 'Kotlin', 'C++', '2.84', '%98+', '%95+', 'ROC-AUC 0.85', 'Mid-level', 'Başkan Yardımcısı']:
            self.assertNotIn(value, prompt)
        self.assertIn('tek yetkili kaynak ONAYLI PROFİL', prompt)
        self.assertIn('yeni kişisel gerçeklerin kaynağı değildir', prompt)
        self.assertIn('Bu bilgi onaylı profilde yer almıyor', prompt)

    def test_file_changes_reach_the_next_prompt_without_restart(self):
        profile = copy.deepcopy(ai_service.load_knowledge_base())
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'profile.json'
            with patch.object(ai_service, 'KNOWLEDGE_BASE_PATH', path):
                path.write_text(json.dumps(profile), encoding='utf-8')
                self.assertIn('2.87/4.0', ai_service.get_system_prompt())
                profile['about']['gpa'] = 'verified-test-value'
                path.write_text(json.dumps(profile), encoding='utf-8')
                self.assertIn('verified-test-value', ai_service.get_system_prompt())
                path.write_text('[]', encoding='utf-8')
                with self.assertRaises(ValueError):
                    ai_service.get_system_prompt()
                path.unlink()
                with self.assertRaises(FileNotFoundError):
                    ai_service.get_system_prompt()
