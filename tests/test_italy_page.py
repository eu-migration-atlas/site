import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
ITALY_PAGE = ROOT / "countries" / "italy.html"


class ItalyPageContentTest(unittest.TestCase):
    def test_italy_page_exists(self):
        self.assertTrue(ITALY_PAGE.exists(), "Italy page should exist")

    def test_europe_map_present(self):
        html = ITALY_PAGE.read_text(encoding="utf-8")
        self.assertIn("class=\"country-map\"", html)
        self.assertIn("Europe at a glance", html)
        self.assertIn("assets/maps/europe.svg", html)


if __name__ == "__main__":
    unittest.main()
