import pytest
import bcrypt

# Monkeypatch bcrypt for passlib compatibility
# passlib expects bcrypt.__about__.__version__ which was removed in newer bcrypt
if not hasattr(bcrypt, "__about__"):

    class About:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = About()


@pytest.fixture(scope="session", autouse=True)
def patch_bcrypt():
    # This fixture ensures the patch is applied when tests start
    pass
