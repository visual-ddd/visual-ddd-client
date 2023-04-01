'创建 embedding 索引'
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import TokenTextSplitter
from langchain.document_loaders import DirectoryLoader
from langchain.vectorstores import Pinecone
import pinecone
import datetime
import os

now = datetime.datetime.now()
input_dir = f'{now.year}-{now.month}-{now.day}'

if not os.path.exists(input_dir):
    print(f"Input directory({input_dir}) does not exist")
    exit(1)

PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
PINECONE_ENVIRONMENT = os.environ.get('PINECONE_ENVIRONMENT')
PINECONE_INDEX = os.environ.get('PINECONE_INDEX')

# 初始化 Pinecone
pinecone.init(
    api_key=PINECONE_API_KEY,
    environment=PINECONE_ENVIRONMENT
)


loader = DirectoryLoader(input_dir)
splitter = TokenTextSplitter(
    encoding_name='gpt2',
    chunk_size=500,
    chunk_overlap=0
)

docs = loader.load_and_split(splitter)

embeddings = OpenAIEmbeddings()

Pinecone.from_documents(
    docs,
    embeddings,
    index_name=PINECONE_INDEX
)
