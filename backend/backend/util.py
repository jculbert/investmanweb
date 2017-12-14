class DictionaryHelper:

    def __init__(self, dict):
        self.dict = dict

    def get(self, key):
        if key in self.dict:
            return self.dict[key]
        else:
            return None
