from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base


class SavedItem(Base):
    __tablename__ = "saved_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)