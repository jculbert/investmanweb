#from transactions.models import Transaction

class DictionaryHelper:

    def __init__(self, dict):
        self.dict = dict

    def get(self, key):
        if key in self.dict:
            return self.dict[key]
        else:
            return None

#def update_acb(account, symbol):
#    t_list = Transaction.objects.filter(account__name=account, symbol__name=symbol).order_by('date')
#    return

