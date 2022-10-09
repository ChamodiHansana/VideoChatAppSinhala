
from django.shortcuts import render
from django.http import  HttpResponse, JsonResponse
import random
import time
from agora_token_builder import RtcTokenBuilder
from .models import RoomMember
import json
from django.views.decorators.csrf import csrf_exempt



# Create your views here.

def lobby(request):
    return render(request, 'base/lobby.html')


def room(request):
    return render(request, 'base/room.html')


def getToken(request):
    appId = "518e76f2e7fe42d5b62a342a578c883f"
    appCertificate = "4a883edcda5c429b955d692d0358d63b"
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600
    currentTimeStamp = int(time.time())
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs)

    return JsonResponse({'token': token, 'uid': uid}, safe=False)


@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    print(data)
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name'],
        type=data['type']
    )
    return JsonResponse({'name': data['name']}, safe=False)


def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    #type= request.GET.get('type')
    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
        # type=type
    )
    name = member.name
    type = member.type
    return JsonResponse({'name': member.name, 'type': member.type,'transcript':member.transcript}, safe=False)


@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    member.delete()
    return JsonResponse('Member deleted', safe=False)

@csrf_exempt
def speechToText(request):
    data = json.loads(request.body)
    print(data)
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,     
    )
    member.transcript = data['transcript']
    member.save()
    return JsonResponse('Subtitle Updated', safe=False)
   
@csrf_exempt
def getSubtitle(request):

    # you can change the request method in the following condition.
    # I dont know what you're dealing with.
    if request.is_ajax() and request.method == 'GET':
        # main logic here setting the value of resp_data
        uid = request.GET.get('UID')
        room_name = request.GET.get('room_name')
    #type= request.GET.get('type')
        member = RoomMember.objects.get(
           uid=uid,
           room_name=room_name,
        # type=type
        )
        resp_data = {
            'transcript': member.transcript,
            # more data
        }

        #return JsonResponse(resp_data, status=200)
        return JsonResponse(resp_data, safe=False)
    #return HttpResponse("{'data':.''}", content_type="text/event-stream")